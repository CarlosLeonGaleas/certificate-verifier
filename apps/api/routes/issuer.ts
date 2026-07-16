import { Hono } from 'hono';
import { z } from 'zod';
import { sign } from 'hono/jwt';
import { argon2Verify } from 'hash-wasm';
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
