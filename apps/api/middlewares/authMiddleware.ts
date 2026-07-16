import { createHmac } from 'crypto';
import { verify } from 'hono/jwt';
import type { MiddlewareHandler } from 'hono';
import { Config } from '../../../packages/core';

const JWT_SECRET = Config.JWT_SECRET;
const APP_SECRET_KEY = Config.APP_SECRET_KEY;

// Middleware for App Request Signing (HMAC-SHA256)
export const signatureMiddleware = (): MiddlewareHandler<{ Variables: { user: any } }> => {
  return async (c, next) => {
    const timestampHeader = c.req.header('X-App-Timestamp');
    const signatureHeader = c.req.header('X-App-Signature');

    if (!timestampHeader || !signatureHeader) {
      return c.json(
        {
          type: 'security',
          code: 'missing_app_signature',
          message: 'Missing required app signature or timestamp headers.'
        },
        403
      );
    }

    // Anti-replay: validation within 5 minutes (300,000 ms)
    const requestTime = parseInt(timestampHeader, 10);
    const currentTime = Date.now();
    
    if (isNaN(requestTime) || Math.abs(currentTime - requestTime) > 5 * 60 * 1000) {
      return c.json(
        {
          type: 'security',
          code: 'invalid_timestamp',
          message: 'Request timestamp is invalid or has expired.'
        },
        403
      );
    }

    try {
      // Clone request to read body without consuming the stream for downstream handlers
      const requestClone = c.req.raw.clone();
      const bodyText = await requestClone.text();
      
      const method = c.req.method.toUpperCase();
      const path = c.req.path;
      
      const message = `${method}:${path}:${timestampHeader}:${bodyText}`;
      
      const hmac = createHmac('sha256', APP_SECRET_KEY);
      hmac.update(message);
      const calculatedSignature = hmac.digest('hex');

      if (calculatedSignature !== signatureHeader) {
        console.warn(`Signature mismatch calculated: ${calculatedSignature} vs received: ${signatureHeader}`);
        return c.json(
          {
            type: 'security',
            code: 'invalid_signature',
            message: 'App signature verification failed.'
          },
          403
        );
      }
    } catch (error) {
      console.error('Error verifying app signature:', error);
      return c.json(
        {
          type: 'security',
          code: 'signature_error',
          message: 'Internal error validating request signature.'
        },
        500
      );
    }

    await next();
  };
};

// Middleware for JWT Verification
export const jwtAuthMiddleware = (): MiddlewareHandler<{ Variables: { user: any } }> => {
  return async (c, next) => {
    // Skip verification for login endpoint
    if (c.req.path === '/api/issuer/auth/login') {
      await next();
      return;
    }

    const authHeader = c.req.header('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return c.json(
        {
          type: 'authentication',
          code: 'missing_jwt',
          message: 'Missing or malformed Authorization header.'
        },
        401
      );
    }

    const token = authHeader.substring(7);

    try {
      const payload = await verify(token, JWT_SECRET, 'HS256');
      
      // Store user claims in context for downstream handlers
      c.set('user', payload);
    } catch (error) {
      console.warn('JWT Verification failed:', error);
      return c.json(
        {
          type: 'authentication',
          code: 'invalid_jwt',
          message: 'Session has expired or token is invalid.'
        },
        401
      );
    }

    await next();
  };
};
