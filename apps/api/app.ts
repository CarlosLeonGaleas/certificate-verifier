import { Hono } from 'hono'
import { certificate } from './certificate'
import { ErrorCodes } from './error';
import { openAPISpecs } from 'hono-openapi'
import { Scalar } from '@scalar/hono-api-reference';
import { HTTPException } from 'hono/http-exception';
import { cors } from 'hono/cors';

const app = new Hono();

// Removida la configuración de CORS - AWS Lambda Function URLs lo maneja automáticamente
// app.use('*', cors({ origin: '*' }))

app
    .route("/api/certificate", certificate)
    .get(
        '/openapi',
        openAPISpecs(app, {
            documentation: {
                info: {
                    title: 'Hono API',
                    version: '1.0.0',
                    description: 'Greeting API',
                },
                servers: [
                    { url: 'http://localhost:3001', description: 'Local Server' },
                ],
            },
        })
    )
    .get(
        '/docs',
        Scalar({
            theme: 'saturn',
            url: '/openapi'
        })
    ).onError((error, c) => {

        // Handle HTTP exceptions
        if (error instanceof HTTPException) {
            console.error("http error:", error);
            return c.json(
                {
                    type: "validation",
                    code: ErrorCodes.Validation.INVALID_PARAMETER,
                    message: "Invalid request",
                },
                400,
            );
        }

        // Handle any other errors as internal server errors
        console.error("unhandled error:", error);
        return c.json(
            {
                type: "internal",
                code: ErrorCodes.Server.INTERNAL_ERROR,
                message: "Internal server error",
            },
            500,
        );
    });


export type ApiType = typeof app;

export default app;
