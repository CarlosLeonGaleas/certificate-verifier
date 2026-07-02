import { Hono } from 'hono';
import { z } from 'zod';
import { sign } from 'hono/jwt';
import { supabase } from './supabaseClient';
import { signatureMiddleware, jwtAuthMiddleware } from './authMiddleware';
import { validator, ErrorResponses } from './common';
import { ErrorCodes } from './error';
import { describeRoute } from 'hono-openapi';
import { resolver } from 'hono-openapi/zod';
import { Config } from '@certificate-verifier/core';

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

      // 2. Validate password using Bun native argon2id verification
      const isPasswordValid = await Bun.password.verify(password, user.password_hash);
      
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
          message: 'Error interno en el servidor durante la autenticación.'
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
