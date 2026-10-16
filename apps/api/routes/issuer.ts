import { Hono } from 'hono';
import { z } from 'zod';
import { sign } from 'hono/jwt';
import { argon2Verify, argon2id } from 'hash-wasm';
import crypto from 'crypto';
import { supabase } from '../lib/supabaseClient';
import { signatureMiddleware, jwtAuthMiddleware } from '../middlewares/authMiddleware';
import { validator, ErrorResponses } from '../utils/common';
import { ErrorCodes } from '../utils/error';
import { describeRoute } from 'hono-openapi';
import { resolver } from 'hono-openapi/zod';
import { Config, Certificate } from '../../../packages/core';

const JWT_SECRET = Config.JWT_SECRET;

const loginSchema = z.object({
  username: z.string().openapi({ description: 'El nombre de usuario' }),
  password: z.string().openapi({ description: 'La contraseña del usuario' })
});

const changePasswordSchema = z.object({
  currentPassword: z.string().openapi({ description: 'La contraseña actual' }),
  newPassword: z.string().openapi({ description: 'La nueva contraseña' })
});

const createAreaSchema = z.object({
  area_code: z
    .string()
    .min(1, 'El código del área es obligatorio')
    .regex(/^[a-zA-Z0-9_-]+$/, 'El código no permite espacios ni caracteres especiales')
    .openapi({ description: 'Código único de área' }),
  area_name: z
    .string()
    .min(1, 'El nombre del área es obligatorio')
    .openapi({ description: 'Nombre descriptivo del área' })
});

const createEventSchema = z.object({
  event_code: z
    .string()
    .min(1, 'El código del evento es obligatorio')
    .regex(/^[a-zA-Z0-9_-]+$/, 'El código no permite espacios ni caracteres especiales')
    .openapi({ description: 'Código único de evento' }),
  event_name: z
    .string()
    .min(1, 'El nombre del evento es obligatorio')
    .openapi({ description: 'Nombre del evento o curso' }),
  details: z.string().optional().openapi({ description: 'Detalles u observaciones opcionales' })
});

export const issuer = new Hono<{ Variables: { user: any } }>();

// Apply application signature check to all endpoints under /api/issuer/*
issuer.use('*', signatureMiddleware());

// Apply JWT verification middleware to all endpoints under /api/issuer/* (except login)
issuer.use('*', jwtAuthMiddleware());

// Login endpoint
issuer.post(
  '/auth/login',
  describeRoute({
    tags: ['Issuer Auth'],
    summary: 'Iniciar sesión de emisor',
    description: 'Valida credenciales con Supabase y genera un token JWT',
    responses: {
      200: {
        description: 'Autenticación exitosa',
        content: {
          'application/json': {
            schema: resolver(
              z.object({
                token: z.string(),
                user: z.object({
                  userID: z.string(),
                  username: z.string(),
                  contact_email: z.string().nullable(),
                  institutionID: z.string(),
                  subscription_plan: z.string().nullable(),
                  certificates_issued: z.number(),
                  certificates_limit: z.number(),
                  is_admin: z.boolean(),
                  is_group_leader: z.boolean()
                })
              })
            )
          }
        }
      },
      401: ErrorResponses[401],
      500: ErrorResponses[500]
    }
  }),
  validator('json', loginSchema),
  async (c) => {
    const { username, password } = c.req.valid('json');

    try {
      // 1. Query Supabase User table joining Institution name
      const { data: user, error } = await supabase
        .from('User')
        .select('*, Institution(institution_name)')
        .eq('username', username)
        .single();

      if (error || !user) {
        console.warn(`Failed login attempt for username: ${username}. User not found.`);
        return c.json(
          {
            type: 'authentication',
            code: ErrorCodes.Authentication.INVALID_CREDENTIALS,
            message: 'Nombre de usuario o contraseña incorrectos.'
          },
          401
        );
      }

      // 2. Validate password using WebAssembly/pure JS argon2id verification (compatible with Node.js and Bun)
      const isPasswordValid = await argon2Verify({
        password: password,
        hash: user.password_hash
      });
      
      if (!isPasswordValid) {
        console.warn(`Failed login attempt for username: ${username}. Password mismatch.`);
        return c.json(
          {
            type: 'authentication',
            code: ErrorCodes.Authentication.INVALID_CREDENTIALS,
            message: 'Nombre de usuario o contraseña incorrectos.'
          },
          401
        );
      }

      // 3. Generate JWT token with custom claims
      const payload = {
        userId: user.userID,
        username: user.username,
        institutionId: user.institutionID,
        contact_email: user.contact_email,
        // Expire in 1 hour
        exp: Math.floor(Date.now() / 1000) + 60 * 60
      };

      const token = await sign(payload, JWT_SECRET);

      return c.json({
        token,
        user: {
          userID: user.userID,
          username: user.username,
          contact_email: user.contact_email,
          institutionID: user.institutionID,
          institutionName: (user as any).Institution?.institution_name || '',
          subscription_plan: user.subscription_plan,
          certificates_issued: user.certificates_issued,
          certificates_limit: user.certificates_limit,
          is_admin: user.is_admin,
          is_group_leader: user.is_group_leader
        }
      }, 200);

    } catch (error) {
      console.error('Error processing login:', error);
      return c.json(
        {
          type: 'internal',
          code: ErrorCodes.Server.INTERNAL_ERROR,
          message: `Error interno en el servidor: ${error instanceof Error ? error.message : String(error)}`
        },
        500
      );
    }
  }
);

// Change password endpoint
issuer.put(
  '/auth/change-password',
  describeRoute({
    tags: ['Issuer Auth'],
    summary: 'Cambiar contraseña de emisor',
    description: 'Valida la contraseña actual y actualiza a la nueva contraseña en Supabase',
    responses: {
      200: {
        description: 'Contraseña cambiada exitosamente',
        content: {
          'application/json': {
            schema: resolver(z.object({ success: z.boolean(), message: z.string() }))
          }
        }
      },
      400: ErrorResponses[400],
      401: ErrorResponses[401],
      500: ErrorResponses[500]
    }
  }),
  validator('json', changePasswordSchema),
  async (c) => {
    const { currentPassword, newPassword } = c.req.valid('json');
    const userContext = c.get('user');
    const userId = userContext.userId;

    try {
      // 1. Get current user's password_hash from Supabase
      const { data: user, error } = await supabase
        .from('User')
        .select('password_hash')
        .eq('userID', userId)
        .single();

      if (error || !user) {
        return c.json(
          {
            type: 'database',
            code: ErrorCodes.Authentication.INVALID_CREDENTIALS,
            message: 'Usuario no encontrado.'
          },
          404
        );
      }

      // 2. Verify current password
      const isPasswordValid = await argon2Verify({
        password: currentPassword,
        hash: user.password_hash
      });

      if (!isPasswordValid) {
        return c.json(
          {
            type: 'authentication',
            code: ErrorCodes.Authentication.INVALID_CREDENTIALS,
            message: 'La contraseña actual es incorrecta.'
          },
          401
        );
      }

      // 3. Generate Argon2id hash for the new password
      const salt = crypto.randomBytes(16);
      const newPasswordHash = await argon2id({
        password: newPassword,
        salt: salt,
        parallelism: 1,
        iterations: 2,
        memorySize: 16384,
        hashLength: 32,
        outputType: 'encoded'
      });

      // 4. Update user's password_hash and updated_at timestamp in Supabase
      const { error: updateError } = await supabase
        .from('User')
        .update({
          password_hash: newPasswordHash,
          updated_at: new Date().toISOString()
        })
        .eq('userID', userId);

      if (updateError) {
        console.error('Error updating password in Supabase:', updateError);
        return c.json(
          {
            type: 'database',
            code: ErrorCodes.Server.INTERNAL_ERROR,
            message: 'Error de base de datos al cambiar la contraseña.'
          },
          500
        );
      }

      return c.json({ success: true, message: 'Contraseña cambiada exitosamente.' }, 200);
    } catch (error) {
      console.error('Error changing password:', error);
      return c.json(
        {
          type: 'internal',
          code: ErrorCodes.Server.INTERNAL_ERROR,
          message: `Error interno del servidor: ${error instanceof Error ? error.message : String(error)}`
        },
        500
      );
    }
  }
);

// Get user's available areas
issuer.get('/areas', async (c) => {
  const user = c.get('user');
  const userId = user.userId;

  try {
    const { data, error } = await supabase
      .from('User_Area')
      .select('is_creator, Area (areaID, institutionID, area_code, area_name, created_at)')
      .eq('userID', userId)
      .eq('is_avaliable', true);

    if (error) {
      console.error('Error fetching areas from Supabase:', error);
      return c.json(
        {
          type: 'database',
          code: ErrorCodes.Server.INTERNAL_ERROR,
          message: 'Error al consultar las áreas en la base de datos.'
        },
        500
      );
    }

    const areas = (data || [])
      .filter((item: any) => item.Area !== null)
      .map((item: any) => ({
        areaID: item.Area.areaID,
        institutionID: item.Area.institutionID,
        area_code: item.Area.area_code,
        area_name: item.Area.area_name,
        created_at: item.Area.created_at,
        is_creator: item.is_creator
      }));

    return c.json(areas, 200);
  } catch (error) {
    console.error('Error in /areas handler:', error);
    return c.json(
      {
        type: 'internal',
        code: ErrorCodes.Server.INTERNAL_ERROR,
        message: 'Error interno del servidor al procesar la solicitud de áreas.'
      },
      500
    );
  }
});

// Get user's available events
issuer.get('/events', async (c) => {
  const user = c.get('user');
  const userId = user.userId;

  try {
    const { data, error } = await supabase
      .from('User_Event')
      .select('is_creator, Event (eventID, event_code, event_name, created_at, institutionID, templateID, details)')
      .eq('userID', userId)
      .eq('is_avaliable', true);

    if (error) {
      console.error('Error fetching events from Supabase:', error);
      return c.json(
        {
          type: 'database',
          code: ErrorCodes.Server.INTERNAL_ERROR,
          message: 'Error al consultar los eventos en la base de datos.'
        },
        500
      );
    }

    const events = (data || [])
      .filter((item: any) => item.Event !== null)
      .map((item: any) => ({
        eventID: item.Event.eventID,
        event_code: item.Event.event_code,
        event_name: item.Event.event_name,
        created_at: item.Event.created_at,
        institutionID: item.Event.institutionID,
        templateID: item.Event.templateID,
        details: item.Event.details,
        is_creator: item.is_creator
      }));

    return c.json(events, 200);
  } catch (error) {
    console.error('Error in /events handler:', error);
    return c.json(
      {
        type: 'internal',
        code: ErrorCodes.Server.INTERNAL_ERROR,
        message: 'Error interno del servidor al procesar la solicitud de eventos.'
      },
      500
    );
  }
});

// Get user's available templates
issuer.get('/templates', async (c) => {
  const user = c.get('user');
  const userId = user.userId;

  try {
    const { data, error } = await supabase
      .from('User_Template')
      .select('is_creator, Template (templateID, template_code, template_name, template_details, created_at, updated_at, institutionID)')
      .eq('userID', userId)
      .eq('is_avaliable', true);

    if (error) {
      console.error('Error fetching templates from Supabase:', error);
      return c.json(
        {
          type: 'database',
          code: ErrorCodes.Server.INTERNAL_ERROR,
          message: 'Error al consultar las plantillas en la base de datos.'
        },
        500
      );
    }

    const templates = (data || [])
      .filter((item: any) => item.Template !== null)
      .map((item: any) => ({
        templateID: item.Template.templateID,
        template_code: item.Template.template_code,
        template_name: item.Template.template_name,
        template_details: item.Template.template_details,
        created_at: item.Template.created_at,
        updated_at: item.Template.updated_at,
        institutionID: item.Template.institutionID,
        is_creator: item.is_creator
      }));

    return c.json(templates, 200);
  } catch (error) {
    console.error('Error in /templates handler:', error);
    return c.json(
      {
        type: 'internal',
        code: ErrorCodes.Server.INTERNAL_ERROR,
        message: 'Error interno del servidor al procesar la solicitud de plantillas.'
      },
      500
    );
  }
});

// Issue certificate in Blockchain
issuer.post(
  '/issue',
  describeRoute({
    tags: ['Issuer Operations'],
    summary: 'Emitir un certificado en la Blockchain',
    description: 'Valida los límites del emisor, realiza la emisión en Polygon y actualiza el contador en Supabase.',
    responses: {
      201: {
        description: 'Emisión exitosa',
        content: {
          'application/json': {
            schema: resolver(
              z.object({
                success: z.boolean(),
                message: z.string(),
                data: z.object({
                  transactionHash: z.string(),
                  tokenId: z.string(),
                  blockNumber: z.number(),
                  gasUsed: z.string()
                }),
                user: z.object({
                  certificates_issued: z.number(),
                  certificates_limit: z.number()
                })
              })
            )
          }
        }
      },
      400: ErrorResponses[400],
      403: {
        description: 'Límite de certificados excedido',
        content: {
          'application/json': {
            schema: resolver(
              z.object({
                type: z.string(),
                code: z.string(),
                message: z.string()
              })
            )
          }
        }
      },
      500: ErrorResponses[500]
    }
  }),
  validator('json', Certificate.IssuanceSchema),
  async (c) => {
    const certParams = c.req.valid('json');
    const { localIssued, localLimit } = certParams;
    const user = c.get('user');
    const userId = user.userId;

    try {
      // 1. Validate certificates limit in Supabase
      const { data: userData, error: userError } = await supabase
        .from('User')
        .select('certificates_issued, certificates_limit')
        .eq('userID', userId)
        .single();

      if (userError || !userData) {
        console.error('Error fetching user data for limits:', userError);
        return c.json(
          {
            type: 'database',
            code: ErrorCodes.Server.INTERNAL_ERROR,
            message: 'Error al verificar los límites del usuario en la base de datos.'
          },
          500
        );
      }

      const dbIssued = userData.certificates_issued;
      const dbLimit = userData.certificates_limit;

      // --- Máquina de Estados y Sincronización (Casos de Fallback) ---

      // Caso 3: Desincronización de límites
      if (localLimit !== dbLimit) {
        console.warn(`[Sync Check] Caso 3: Desincronización de límites. Local: ${localLimit}, DB: ${dbLimit}`);
        return c.json(
          {
            success: false,
            action: 'FORCE_LOGOUT',
            code: 'LIMIT_MISMATCH',
            message: 'Desincronización en el límite de certificados.'
          },
          409
        );
      }

      // Evaluar diferencias en los contadores de emisión
      if (localIssued !== dbIssued) {
        // Caso 1: Desincronización de 1 unidad (Fallback +1)
        if (localIssued === dbIssued + 1) {
          console.log(`[Sync Check] Caso 1: Sincronizando Supabase con localIssued (${localIssued})`);
          const { error: updateError } = await supabase
            .from('User')
            .update({ certificates_issued: localIssued })
            .eq('userID', userId);

          if (updateError) {
            console.error('Error al actualizar contador en Caso 1:', updateError);
            return c.json(
              {
                type: 'database',
                code: ErrorCodes.Server.INTERNAL_ERROR,
                message: 'Error al actualizar base de datos en recuperación de desincronización.'
              },
              500
            );
          }

          return c.json(
            {
              success: false,
              action: 'FORCE_LOGOUT',
              code: 'SYNC_FALLBACK_RECOVERED',
              message: 'El certificado anterior fue emitido en blockchain. Contador de base de datos sincronizado.'
            },
            409
          );
        }

        // Caso 2: Cualquier otra diferencia de contador (Desincronización mayor)
        console.warn(`[Sync Check] Caso 2: Desincronización mayor. Local: ${localIssued}, DB: ${dbIssued}`);
        return c.json(
          {
            success: false,
            action: 'FORCE_LOGOUT',
            code: 'ISSUED_COUNT_MISMATCH',
            message: 'Desincronización en el contador de certificados emitidos.'
          },
          409
        );
      }

      // Caso 0: Sincronización normal (localIssued === dbIssued)
      if (dbIssued >= dbLimit) {
        return c.json(
          {
            type: 'authorization',
            code: 'CERTIFICATE_LIMIT_EXCEEDED',
            message: `Límite de certificados excedido. Límite: ${dbLimit}, Emitidos: ${dbIssued}`
          },
          403
        );
      }

      // 2. Issue the certificate in Blockchain
      const certificateIssuer = new Certificate.CertificateIssuer();
      const blockchainResult = await certificateIssuer.issue(certParams);

      // 3. Update certificates_issued count in Supabase
      const newIssuedCount = dbIssued + 1;
      const { error: updateError } = await supabase
        .from('User')
        .update({ certificates_issued: newIssuedCount })
        .eq('userID', userId);

      if (updateError) {
        console.error('Error updating certificates_issued count in Supabase:', updateError);
        return c.json(
          {
            success: true,
            message: 'Certificado emitido en blockchain, pero hubo un error al actualizar los contadores locales.',
            data: blockchainResult,
            user: {
              certificates_issued: dbIssued,
              certificates_limit: dbLimit
            }
          },
          201
        );
      }

      return c.json(
        {
          success: true,
          message: 'Certificado emitido exitosamente en la blockchain.',
          data: blockchainResult,
          user: {
            certificates_issued: newIssuedCount,
            certificates_limit: dbLimit
          }
        },
        201
      );

    } catch (error) {
      console.error('Error issuing certificate:', error);
      return c.json(
        {
          type: 'blockchain',
          code: ErrorCodes.Server.INTERNAL_ERROR,
          message: `Error al emitir el certificado en la blockchain: ${error instanceof Error ? error.message : String(error)}`
        },
        500
      );
    }
  }
);

// Disable template for user
issuer.put(
  '/templates/:templateId/disable',
  describeRoute({
    tags: ['Issuer Operations'],
    summary: 'Deshabilitar una plantilla para el usuario',
    description: 'Modifica is_avaliable a false en la tabla User_Template para el usuario autenticado',
    responses: {
      200: {
        description: 'Plantilla deshabilitada exitosamente',
        content: {
          'application/json': {
            schema: resolver(z.object({ success: z.boolean(), message: z.string() }))
          }
        }
      },
      500: ErrorResponses[500]
    }
  }),
  async (c) => {
    const user = c.get('user');
    const userId = user.userId;
    const templateId = c.req.param('templateId');

    const { error } = await supabase
      .from('User_Template')
      .update({
        is_avaliable: false,
        disabled_at: new Date().toISOString()
      })
      .eq('userID', userId)
      .eq('templateID', templateId);

    if (error) {
      console.error('Error disabling template in Supabase:', error);
      return c.json(
        {
          type: 'database',
          code: ErrorCodes.Server.INTERNAL_ERROR,
          message: 'Error al deshabilitar la plantilla en la base de datos.'
        },
        500
      );
    }

    return c.json({ success: true, message: 'Plantilla deshabilitada exitosamente' }, 200);
  }
);

// Get available templates from user's institution (that the user does not have active)
issuer.get(
  '/templates/institution',
  describeRoute({
    tags: ['Issuer Operations'],
    summary: 'Obtener las plantillas de la institución que el usuario no tiene activas',
    description: 'Filtra las plantillas por el institutionID del usuario y descarta las activas',
    responses: {
      200: {
        description: 'Lista de plantillas de la institución disponibles'
      },
      500: ErrorResponses[500]
    }
  }),
  async (c) => {
    const user = c.get('user');
    const userId = user.userId;
    const institutionId = user.institutionId;

    try {
      // 1. Fetch templates belonging to the user's institution
      const { data: instTemplates, error: templatesError } = await supabase
        .from('Template')
        .select('templateID, template_code, template_name, template_details, created_at, updated_at, institutionID')
        .eq('institutionID', institutionId);

      if (templatesError) {
        console.error('Error fetching institution templates:', templatesError);
        return c.json(
          {
            type: 'database',
            code: ErrorCodes.Server.INTERNAL_ERROR,
            message: 'Error al obtener las plantillas de la institución.'
          },
          500
        );
      }

      // 2. Fetch all mappings for this user in User_Template
      const { data: userTemplates, error: mappingsError } = await supabase
        .from('User_Template')
        .select('templateID, is_avaliable')
        .eq('userID', userId);

      if (mappingsError) {
        console.error('Error fetching user template mappings:', mappingsError);
        return c.json(
          {
            type: 'database',
            code: ErrorCodes.Server.INTERNAL_ERROR,
            message: 'Error al obtener mapeos de plantillas de usuario.'
          },
          500
        );
      }

      // Create lookup map
      const userTemplateMap = new Map<string, boolean>(
        (userTemplates || []).map((ut: any) => [ut.templateID, ut.is_avaliable])
      );

      // Filter templates: show if user doesn't have it or has it but disabled
      const result = (instTemplates || [])
        .filter((t: any) => {
          const isAvailable = userTemplateMap.get(t.templateID);
          return isAvailable === undefined || isAvailable === false;
        })
        .map((t: any) => {
          const hasRecord = userTemplateMap.has(t.templateID);
          return {
            templateID: t.templateID,
            template_code: t.template_code,
            template_name: t.template_name,
            template_details: t.template_details,
            created_at: t.created_at,
            updated_at: t.updated_at,
            institutionID: t.institutionID,
            hasRecord
          };
        });

      return c.json(result, 200);
    } catch (error) {
      console.error('Error in /templates/institution handler:', error);
      return c.json(
        {
          type: 'internal',
          code: ErrorCodes.Server.INTERNAL_ERROR,
          message: 'Error interno del servidor al procesar la consulta.'
        },
        500
      );
    }
  }
);

// Obtain or enable a template for the user
issuer.post(
  '/templates/:templateId/obtain',
  describeRoute({
    tags: ['Issuer Operations'],
    summary: 'Obtener o habilitar una plantilla de la institución',
    description: 'Inserta un registro en User_Template o actualiza is_avaliable a true',
    responses: {
      200: {
        description: 'Plantilla obtenida exitosamente'
      },
      500: ErrorResponses[500]
    }
  }),
  async (c) => {
    const user = c.get('user');
    const userId = user.userId;
    const templateId = c.req.param('templateId');

    try {
      // 1. Check if mapping record already exists
      const { data: existing, error: checkError } = await supabase
        .from('User_Template')
        .select('userID, templateID')
        .eq('userID', userId)
        .eq('templateID', templateId)
        .maybeSingle();

      if (checkError) {
        console.error('Error checking existing mapping:', checkError);
        return c.json(
          {
            type: 'database',
            code: ErrorCodes.Server.INTERNAL_ERROR,
            message: 'Error de base de datos al verificar existencia.'
          },
          500
        );
      }

      if (existing) {
        // Update record to enable it
        const { error: updateError } = await supabase
          .from('User_Template')
          .update({
            is_avaliable: true,
            disabled_at: null
          })
          .eq('userID', userId)
          .eq('templateID', templateId);

        if (updateError) {
          console.error('Error updating template mapping:', updateError);
          return c.json(
            {
              type: 'database',
              code: ErrorCodes.Server.INTERNAL_ERROR,
              message: 'Error al habilitar la plantilla.'
            },
            500
          );
        }
      } else {
        // Insert new association
        const { error: insertError } = await supabase
          .from('User_Template')
          .insert({
            userID: userId,
            templateID: templateId,
            is_creator: false,
            is_avaliable: true
          });

        if (insertError) {
          console.error('Error inserting template mapping:', insertError);
          return c.json(
            {
              type: 'database',
              code: ErrorCodes.Server.INTERNAL_ERROR,
              message: 'Error al asociar la plantilla a tu cuenta.'
            },
            500
          );
        }
      }

      return c.json({ success: true, message: 'Plantilla obtenida exitosamente.' }, 200);
    } catch (error) {
      console.error('Error in /templates/:templateId/obtain handler:', error);
      return c.json(
        {
          type: 'internal',
          code: ErrorCodes.Server.INTERNAL_ERROR,
          message: 'Error interno del servidor al procesar la asociación.'
        },
        500
      );
    }
  }
);

// Disable Area for user
issuer.put(
  '/areas/:areaId/disable',
  describeRoute({
    tags: ['Issuer Operations'],
    summary: 'Deshabilitar un área para el usuario',
    description: 'Modifica is_avaliable a false en la tabla User_Area para el usuario autenticado',
    responses: {
      200: {
        description: 'Área deshabilitada exitosamente'
      },
      500: ErrorResponses[500]
    }
  }),
  async (c) => {
    const user = c.get('user');
    const userId = user.userId;
    const areaId = c.req.param('areaId');

    try {
      const { error } = await supabase
        .from('User_Area')
        .update({
          is_avaliable: false,
          disabled_at: new Date().toISOString()
        })
        .eq('userID', userId)
        .eq('areaID', areaId);

      if (error) {
        console.error('Error disabling area in Supabase:', error);
        return c.json(
          {
            type: 'database',
            code: ErrorCodes.Server.INTERNAL_ERROR,
            message: 'Error al deshabilitar el área en la base de datos.'
          },
          500
        );
      }

      return c.json({ success: true, message: 'Área deshabilitada exitosamente' }, 200);
    } catch (error) {
      console.error('Error in /areas/:areaId/disable handler:', error);
      return c.json(
        {
          type: 'internal',
          code: ErrorCodes.Server.INTERNAL_ERROR,
          message: 'Error interno del servidor.'
        },
        500
      );
    }
  }
);

// Get available areas from user's institution (that the user does not have active)
issuer.get(
  '/areas/institution',
  describeRoute({
    tags: ['Issuer Operations'],
    summary: 'Obtener las áreas de la institución que el usuario no tiene activas',
    description: 'Filtra las áreas por el institutionID del usuario y descarta las activas',
    responses: {
      200: {
        description: 'Lista de áreas de la institución disponibles'
      },
      500: ErrorResponses[500]
    }
  }),
  async (c) => {
    const user = c.get('user');
    const userId = user.userId;
    const institutionId = user.institutionId;

    try {
      // 1. Fetch areas belonging to the user's institution
      const { data: instAreas, error: areasError } = await supabase
        .from('Area')
        .select('areaID, institutionID, area_code, area_name, created_at')
        .eq('institutionID', institutionId);

      if (areasError) {
        console.error('Error fetching institution areas:', areasError);
        return c.json(
          {
            type: 'database',
            code: ErrorCodes.Server.INTERNAL_ERROR,
            message: 'Error al obtener las áreas de la institución.'
          },
          500
        );
      }

      // 2. Fetch all mappings for this user in User_Area
      const { data: userAreas, error: mappingsError } = await supabase
        .from('User_Area')
        .select('areaID, is_avaliable')
        .eq('userID', userId);

      if (mappingsError) {
        console.error('Error fetching user area mappings:', mappingsError);
        return c.json(
          {
            type: 'database',
            code: ErrorCodes.Server.INTERNAL_ERROR,
            message: 'Error al obtener mapeos de áreas de usuario.'
          },
          500
        );
      }

      // Create lookup map
      const userAreaMap = new Map<string, boolean>(
        (userAreas || []).map((ua: any) => [ua.areaID, ua.is_avaliable])
      );

      // Filter areas: show if user doesn't have it or has it but disabled
      const result = (instAreas || [])
        .filter((a: any) => {
          const isAvailable = userAreaMap.get(a.areaID);
          return isAvailable === undefined || isAvailable === false;
        })
        .map((a: any) => {
          const hasRecord = userAreaMap.has(a.areaID);
          return {
            areaID: a.areaID,
            institutionID: a.institutionID,
            area_code: a.area_code,
            area_name: a.area_name,
            created_at: a.created_at,
            hasRecord
          };
        });

      return c.json(result, 200);
    } catch (error) {
      console.error('Error in /areas/institution handler:', error);
      return c.json(
        {
          type: 'internal',
          code: ErrorCodes.Server.INTERNAL_ERROR,
          message: 'Error interno del servidor al procesar la consulta.'
        },
        500
      );
    }
  }
);

// Obtain or enable an area for the user
issuer.post(
  '/areas/:areaId/obtain',
  describeRoute({
    tags: ['Issuer Operations'],
    summary: 'Obtener o habilitar un área de la institución',
    description: 'Inserta un registro en User_Area o actualiza is_avaliable a true',
    responses: {
      200: {
        description: 'Área obtenida exitosamente'
      },
      500: ErrorResponses[500]
    }
  }),
  async (c) => {
    const user = c.get('user');
    const userId = user.userId;
    const areaId = c.req.param('areaId');

    try {
      // 1. Check if mapping record already exists
      const { data: existing, error: checkError } = await supabase
        .from('User_Area')
        .select('userID, areaID')
        .eq('userID', userId)
        .eq('areaID', areaId)
        .maybeSingle();

      if (checkError) {
        console.error('Error checking existing mapping:', checkError);
        return c.json(
          {
            type: 'database',
            code: ErrorCodes.Server.INTERNAL_ERROR,
            message: 'Error de base de datos al verificar existencia.'
          },
          500
        );
      }

      if (existing) {
        // Update record to enable it
        const { error: updateError } = await supabase
          .from('User_Area')
          .update({
            is_avaliable: true,
            disabled_at: null
          })
          .eq('userID', userId)
          .eq('areaID', areaId);

        if (updateError) {
          console.error('Error updating area mapping:', updateError);
          return c.json(
            {
              type: 'database',
              code: ErrorCodes.Server.INTERNAL_ERROR,
              message: 'Error al habilitar el área.'
            },
            500
          );
        }
      } else {
        // Insert new association
        const { error: insertError } = await supabase
          .from('User_Area')
          .insert({
            userID: userId,
            areaID: areaId,
            is_creator: false,
            is_avaliable: true
          });

        if (insertError) {
          console.error('Error inserting area mapping:', insertError);
          return c.json(
            {
              type: 'database',
              code: ErrorCodes.Server.INTERNAL_ERROR,
              message: 'Error al asociar el área a tu cuenta.'
            },
            500
          );
        }
      }

      return c.json({ success: true, message: 'Área obtenida exitosamente.' }, 200);
    } catch (error) {
      console.error('Error in /areas/:areaId/obtain handler:', error);
      return c.json(
        {
          type: 'internal',
          code: ErrorCodes.Server.INTERNAL_ERROR,
          message: 'Error interno del servidor al procesar la asociación.'
        },
        500
      );
    }
  }
);

// Disable Event for user
issuer.put(
  '/events/:eventId/disable',
  describeRoute({
    tags: ['Issuer Operations'],
    summary: 'Deshabilitar un evento/curso para el usuario',
    description: 'Modifica is_avaliable a false en la tabla User_Event para el usuario autenticado',
    responses: {
      200: {
        description: 'Evento deshabilitado exitosamente'
      },
      500: ErrorResponses[500]
    }
  }),
  async (c) => {
    const user = c.get('user');
    const userId = user.userId;
    const eventId = c.req.param('eventId');

    try {
      const { error } = await supabase
        .from('User_Event')
        .update({
          is_avaliable: false,
          disabled_at: new Date().toISOString()
        })
        .eq('userID', userId)
        .eq('eventID', eventId);

      if (error) {
        console.error('Error disabling event in Supabase:', error);
        return c.json(
          {
            type: 'database',
            code: ErrorCodes.Server.INTERNAL_ERROR,
            message: 'Error al deshabilitar el evento en la base de datos.'
          },
          500
        );
      }

      return c.json({ success: true, message: 'Evento deshabilitado exitosamente' }, 200);
    } catch (error) {
      console.error('Error in /events/:eventId/disable handler:', error);
      return c.json(
        {
          type: 'internal',
          code: ErrorCodes.Server.INTERNAL_ERROR,
          message: 'Error interno del servidor.'
        },
        500
      );
    }
  }
);

// Get available events from user's institution (that the user does not have active)
issuer.get(
  '/events/institution',
  describeRoute({
    tags: ['Issuer Operations'],
    summary: 'Obtener los eventos de la institución que el usuario no tiene activos',
    description: 'Filtra los eventos por el institutionID del usuario y descarta los activos',
    responses: {
      200: {
        description: 'Lista de eventos de la institución disponibles'
      },
      500: ErrorResponses[500]
    }
  }),
  async (c) => {
    const user = c.get('user');
    const userId = user.userId;
    const institutionId = user.institutionId;

    try {
      // 1. Fetch events belonging to the user's institution
      const { data: instEvents, error: eventsError } = await supabase
        .from('Event')
        .select('eventID, event_code, event_name, created_at, institutionID, templateID, details')
        .eq('institutionID', institutionId);

      if (eventsError) {
        console.error('Error fetching institution events:', eventsError);
        return c.json(
          {
            type: 'database',
            code: ErrorCodes.Server.INTERNAL_ERROR,
            message: 'Error al obtener los eventos de la institución.'
          },
          500
        );
      }

      // 2. Fetch all mappings for this user in User_Event
      const { data: userEvents, error: mappingsError } = await supabase
        .from('User_Event')
        .select('eventID, is_avaliable')
        .eq('userID', userId);

      if (mappingsError) {
        console.error('Error fetching user event mappings:', mappingsError);
        return c.json(
          {
            type: 'database',
            code: ErrorCodes.Server.INTERNAL_ERROR,
            message: 'Error al obtener mapeos de eventos de usuario.'
          },
          500
        );
      }

      // Create lookup map
      const userEventMap = new Map<string, boolean>(
        (userEvents || []).map((ue: any) => [ue.eventID, ue.is_avaliable])
      );

      // Filter events: show if user doesn't have it or has it but disabled
      const result = (instEvents || [])
        .filter((e: any) => {
          const isAvailable = userEventMap.get(e.eventID);
          return isAvailable === undefined || isAvailable === false;
        })
        .map((e: any) => {
          const hasRecord = userEventMap.has(e.eventID);
          return {
            eventID: e.eventID,
            event_code: e.event_code,
            event_name: e.event_name,
            created_at: e.created_at,
            institutionID: e.institutionID,
            templateID: e.templateID,
            details: e.details,
            hasRecord
          };
        });

      return c.json(result, 200);
    } catch (error) {
      console.error('Error in /events/institution handler:', error);
      return c.json(
        {
          type: 'internal',
          code: ErrorCodes.Server.INTERNAL_ERROR,
          message: 'Error interno del servidor al procesar la consulta.'
        },
        500
      );
    }
  }
);

// Obtain or enable an event for the user
issuer.post(
  '/events/:eventId/obtain',
  describeRoute({
    tags: ['Issuer Operations'],
    summary: 'Obtener o habilitar un evento de la institución',
    description: 'Inserta un registro en User_Event o actualiza is_avaliable a true',
    responses: {
      200: {
        description: 'Evento obtenido exitosamente'
      },
      500: ErrorResponses[500]
    }
  }),
  async (c) => {
    const user = c.get('user');
    const userId = user.userId;
    const eventId = c.req.param('eventId');

    try {
      // 1. Check if mapping record already exists
      const { data: existing, error: checkError } = await supabase
        .from('User_Event')
        .select('userID, eventID')
        .eq('userID', userId)
        .eq('eventID', eventId)
        .maybeSingle();

      if (checkError) {
        console.error('Error checking existing mapping:', checkError);
        return c.json(
          {
            type: 'database',
            code: ErrorCodes.Server.INTERNAL_ERROR,
            message: 'Error de base de datos al verificar existencia.'
          },
          500
        );
      }

      if (existing) {
        // Update record to enable it
        const { error: updateError } = await supabase
          .from('User_Event')
          .update({
            is_avaliable: true,
            disabled_at: null
          })
          .eq('userID', userId)
          .eq('eventID', eventId);

        if (updateError) {
          console.error('Error updating event mapping:', updateError);
          return c.json(
            {
              type: 'database',
              code: ErrorCodes.Server.INTERNAL_ERROR,
              message: 'Error al habilitar el evento.'
            },
            500
          );
        }
      } else {
        // Insert new association
        const { error: insertError } = await supabase
          .from('User_Event')
          .insert({
            userID: userId,
            eventID: eventId,
            is_creator: false,
            is_avaliable: true
          });

        if (insertError) {
          console.error('Error inserting event mapping:', insertError);
          return c.json(
            {
              type: 'database',
              code: ErrorCodes.Server.INTERNAL_ERROR,
              message: 'Error al asociar el evento a tu cuenta.'
            },
            500
          );
        }
      }

      return c.json({ success: true, message: 'Evento obtenido exitosamente.' }, 200);
    } catch (error) {
      console.error('Error in /events/:eventId/obtain handler:', error);
      return c.json(
        {
          type: 'internal',
          code: ErrorCodes.Server.INTERNAL_ERROR,
          message: 'Error interno del servidor al procesar la asociación.'
        },
        500
      );
    }
  }
);

// Create new Area for institution and associate to creator user
issuer.post(
  '/areas',
  describeRoute({
    tags: ['Issuer Operations'],
    summary: 'Crear una nueva área y vincularla al emisor',
    description: 'Crea el área en la tabla Area y su relación activa en User_Area',
    responses: {
      201: {
        description: 'Área creada y asociada exitosamente'
      },
      400: ErrorResponses[400],
      500: ErrorResponses[500]
    }
  }),
  validator('json', createAreaSchema),
  async (c) => {
    const user = c.get('user');
    const userId = user.userId;
    const institutionId = user.institutionId;
    const { area_code, area_name } = c.req.valid('json');

    try {
      // 1. Insert new Area into Supabase
      const { data: newArea, error: areaError } = await supabase
        .from('Area')
        .insert({
          institutionID: institutionId,
          area_code,
          area_name
        })
        .select()
        .single();

      if (areaError || !newArea) {
        console.error('Error inserting Area in Supabase:', areaError);
        return c.json(
          {
            type: 'database',
            code: ErrorCodes.Server.INTERNAL_ERROR,
            message: areaError?.message || 'Error al crear el área en la base de datos.'
          },
          400
        );
      }

      // 2. Insert relation into User_Area
      const { error: mappingError } = await supabase
        .from('User_Area')
        .insert({
          userID: userId,
          areaID: newArea.areaID,
          is_creator: true,
          is_avaliable: true,
          created_at: new Date().toISOString()
        });

      if (mappingError) {
        console.error('Error inserting User_Area mapping in Supabase:', mappingError);
        return c.json(
          {
            type: 'database',
            code: ErrorCodes.Server.INTERNAL_ERROR,
            message: 'Área creada, pero ocurrió un error al vincularla con su usuario emisor.'
          },
          500
        );
      }

      return c.json(
        {
          success: true,
          message: 'Área creada y asociada con éxito.',
          data: newArea
        },
        201
      );
    } catch (error) {
      console.error('Error in POST /areas handler:', error);
      return c.json(
        {
          type: 'internal',
          code: ErrorCodes.Server.INTERNAL_ERROR,
          message: 'Error interno del servidor al crear el área.'
        },
        500
      );
    }
  }
);

// Create new Event for institution and associate to creator user
issuer.post(
  '/events',
  describeRoute({
    tags: ['Issuer Operations'],
    summary: 'Crear un nuevo evento/curso y vincularlo al emisor',
    description: 'Crea el evento en la tabla Event y su relación activa en User_Event',
    responses: {
      201: {
        description: 'Evento creado y asociado exitosamente'
      },
      400: ErrorResponses[400],
      500: ErrorResponses[500]
    }
  }),
  validator('json', createEventSchema),
  async (c) => {
    const user = c.get('user');
    const userId = user.userId;
    const institutionId = user.institutionId;
    const { event_code, event_name, details } = c.req.valid('json');

    try {
      // 1. Insert new Event into Supabase
      const { data: newEvent, error: eventError } = await supabase
        .from('Event')
        .insert({
          institutionID: institutionId,
          event_code,
          event_name,
          details: details || null,
          templateID: null
        })
        .select()
        .single();

      if (eventError || !newEvent) {
        console.error('Error inserting Event in Supabase:', eventError);
        return c.json(
          {
            type: 'database',
            code: ErrorCodes.Server.INTERNAL_ERROR,
            message: eventError?.message || 'Error al crear el evento en la base de datos.'
          },
          400
        );
      }

      // 2. Insert relation into User_Event
      const { error: mappingError } = await supabase
        .from('User_Event')
        .insert({
          userID: userId,
          eventID: newEvent.eventID,
          is_creator: true,
          is_avaliable: true,
          created_at: new Date().toISOString()
        });

      if (mappingError) {
        console.error('Error inserting User_Event mapping in Supabase:', mappingError);
        return c.json(
          {
            type: 'database',
            code: ErrorCodes.Server.INTERNAL_ERROR,
            message: 'Evento creado, pero ocurrió un error al vincularlo con su usuario emisor.'
          },
          500
        );
      }

      return c.json(
        {
          success: true,
          message: 'Evento creado y asociado con éxito.',
          data: newEvent
        },
        201
      );
    } catch (error) {
      console.error('Error in POST /events handler:', error);
      return c.json(
        {
          type: 'internal',
          code: ErrorCodes.Server.INTERNAL_ERROR,
          message: 'Error interno del servidor al crear el evento.'
        },
        500
      );
    }
  }
);

// Create new Template for institution and associate to creator user
const createTemplateSchema = z.object({
  template_name: z.string().min(1, 'El nombre de la plantilla es obligatorio'),
  template_details: z.string().optional(),
  template_html: z.string().min(1, 'El código HTML de la plantilla es obligatorio')
});

issuer.post(
  '/templates',
  describeRoute({
    tags: ['Issuer Operations'],
    summary: 'Crear una nueva plantilla de certificado y vincularla al emisor',
    description: 'Genera el template_code automático (BACKGROUND0XX), inserta en Template y User_Template',
    responses: {
      201: {
        description: 'Plantilla creada y asociada exitosamente'
      },
      400: ErrorResponses[400],
      500: ErrorResponses[500]
    }
  }),
  validator('json', createTemplateSchema),
  async (c) => {
    const user = c.get('user');
    const userId = user.userId;
    const institutionId = user.institutionId;
    const { template_name, template_details, template_html } = c.req.valid('json');

    try {
      // 1. Determine next template_code (BACKGROUND0XX)
      const { count, error: countError } = await supabase
        .from('Template')
        .select('*', { count: 'exact', head: true });

      if (countError) {
        console.error('Error counting templates:', countError);
      }

      let candidateNum = (count || 0) + 4;
      let templateCode = `BACKGROUND${String(candidateNum).padStart(3, '0')}`;

      // Guarantee code uniqueness in case candidateNum is taken
      let isUnique = false;
      let attempts = 0;
      while (!isUnique && attempts < 100) {
        const { data: existing } = await supabase
          .from('Template')
          .select('templateID')
          .eq('template_code', templateCode)
          .maybeSingle();

        if (!existing) {
          isUnique = true;
        } else {
          candidateNum += 1;
          templateCode = `BACKGROUND${String(candidateNum).padStart(3, '0')}`;
          attempts += 1;
        }
      }

      const nowIso = new Date().toISOString();

      // 2. Insert new Template into Supabase
      const { data: newTemplate, error: templateError } = await supabase
        .from('Template')
        .insert({
          institutionID: institutionId,
          template_code: templateCode,
          template_name,
          template_details: template_details || null,
          template_html,
          created_at: nowIso,
          updated_at: nowIso
        })
        .select()
        .single();

      if (templateError || !newTemplate) {
        console.error('Error inserting Template in Supabase:', templateError);
        return c.json(
          {
            type: 'database',
            code: ErrorCodes.Server.INTERNAL_ERROR,
            message: templateError?.message || 'Error al crear la plantilla en la base de datos.'
          },
          400
        );
      }

      // 3. Insert relation into User_Template
      const { error: mappingError } = await supabase
        .from('User_Template')
        .insert({
          userID: userId,
          templateID: newTemplate.templateID,
          is_creator: true,
          is_avaliable: true,
          created_at: nowIso
        });

      if (mappingError) {
        console.error('Error inserting User_Template mapping in Supabase:', mappingError);
        return c.json(
          {
            type: 'database',
            code: ErrorCodes.Server.INTERNAL_ERROR,
            message: 'Plantilla creada, pero ocurrió un error al vincularla con su usuario emisor.'
          },
          500
        );
      }

      return c.json(
        {
          success: true,
          message: 'Plantilla creada y asociada con éxito.',
          data: newTemplate
        },
        201
      );
    } catch (error) {
      console.error('Error in POST /templates handler:', error);
      return c.json(
        {
          type: 'internal',
          code: ErrorCodes.Server.INTERNAL_ERROR,
          message: 'Error interno del servidor al crear la plantilla.'
        },
        500
      );
    }
  }
);

// ==========================================
// CERTIFICATE MANAGEMENT ENDPOINTS
// ==========================================

// Get paginated certificates by user's institution
issuer.get(
  '/certificates/institution',
  describeRoute({
    tags: ['Issuer Certificates'],
    summary: 'Obtener catálogo paginado de certificados de la institución',
    description: 'Consulta los certificados en blockchain emitidos por la institución del usuario autenticado.',
    responses: {
      200: {
        description: 'Catálogo de certificados recuperado exitosamente'
      },
      500: ErrorResponses[500]
    }
  }),
  async (c) => {
    const user = c.get('user');
    const institutionId = user.institutionId;

    try {
      const offset = parseInt(c.req.query('offset') || '0', 10);
      const limit = parseInt(c.req.query('limit') || '10', 10);

      // Query institution name from Supabase using user's institutionId
      const { data: instData, error: instError } = await supabase
        .from('Institution')
        .select('institution_name')
        .eq('institutionID', institutionId)
        .single();

      if (instError || !instData || !instData.institution_name) {
        console.error('Error fetching institution_name from Supabase:', instError);
        return c.json(
          {
            type: 'database',
            code: ErrorCodes.Server.INTERNAL_ERROR,
            message: 'No se pudo identificar el nombre de la institución para la consulta en blockchain.'
          },
          500
        );
      }

      const institutionName = instData.institution_name;
      const retriever = new Certificate.CertificateRetriever();
      const result = await retriever.getCertificatesByInstitution(institutionName, offset, limit);

      return c.json(
        {
          success: true,
          data: result.certificates,
          certificates: result.certificates,
          totalCount: result.totalCount,
          totalPages: result.totalPages,
          institutionName
        },
        200
      );
    } catch (error) {
      console.error('Error in GET /certificates/institution:', error);
      return c.json(
        {
          type: 'blockchain',
          code: ErrorCodes.Server.INTERNAL_ERROR,
          message: `Error al consultar certificados en blockchain: ${error instanceof Error ? error.message : String(error)}`
        },
        500
      );
    }
  }
);

// Get certificates by document ID (filtered by user's institution with complete hash/timestamp info)
issuer.get(
  '/certificates/document/:documentId',
  describeRoute({
    tags: ['Issuer Certificates'],
    summary: 'Obtener certificados por cédula de la institución',
    description: 'Consulta los certificados en blockchain asociados a una cédula para la institución del usuario autenticado.',
    responses: {
      200: {
        description: 'Certificados recuperados exitosamente'
      },
      500: ErrorResponses[500]
    }
  }),
  async (c) => {
    const user = c.get('user');
    const institutionId = user.institutionId;
    const documentId = c.req.param('documentId');

    if (!documentId) {
      return c.json(
        {
          type: 'validation',
          code: ErrorCodes.Validation.REQUIRED_FIELD,
          message: 'El número de cédula es requerido.'
        },
        400
      );
    }

    try {
      const { data: instData, error: instError } = await supabase
        .from('Institution')
        .select('institution_name')
        .eq('institutionID', institutionId)
        .single();

      if (instError || !instData || !instData.institution_name) {
        console.error('Error fetching institution_name from Supabase:', instError);
        return c.json(
          {
            type: 'database',
            code: ErrorCodes.Server.INTERNAL_ERROR,
            message: 'No se pudo identificar el nombre de la institución para la consulta.'
          },
          500
        );
      }

      const institutionName = instData.institution_name;
      const retriever = new Certificate.CertificateRetriever();
      const allCerts = await retriever.getCertificatesWithHashFromDocumentId(documentId);

      const institutionCerts = allCerts.filter(
        (cert) => cert.institution.trim().toLowerCase() === institutionName.trim().toLowerCase()
      );

      return c.json(
        {
          success: true,
          data: institutionCerts,
          certificates: institutionCerts,
          totalCount: institutionCerts.length,
          allCount: allCerts.length,
          institutionName
        },
        200
      );
    } catch (error) {
      console.error('Error in GET /certificates/document/:documentId:', error);
      return c.json(
        {
          type: 'blockchain',
          code: ErrorCodes.Server.INTERNAL_ERROR,
          message: `Error al consultar certificados en blockchain: ${error instanceof Error ? error.message : String(error)}`
        },
        500
      );
    }
  }
);
