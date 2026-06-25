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
        // Expire in 30 minutes
        exp: Math.floor(Date.now() / 1000) + 30 * 60
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

// Protected routes placeholders for testing JWT validity
issuer.get('/areas', async (c) => {
  const user = c.get('user');
  return c.json({ success: true, message: 'JWT validation successful', user });
});

issuer.get('/events', async (c) => {
  const user = c.get('user');
  return c.json({ success: true, message: 'JWT validation successful', user });
});
