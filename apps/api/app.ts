import { Hono } from 'hono'
import { certificate } from './routes/certificate'
import { issuer } from './routes/issuer'
import { template } from './routes/template'
import { ErrorCodes } from './utils/error';
import { openAPISpecs } from 'hono-openapi'
import { Scalar } from '@scalar/hono-api-reference';
import { HTTPException } from 'hono/http-exception';
import { cors } from 'hono/cors';

const app = new Hono();

// Habilitar CORS solo en desarrollo local (fuera de AWS Lambda)
// En AWS, Lambda Function URLs maneja CORS automáticamente a nivel de infraestructura para evitar duplicar cabeceras.
if (!process.env.AWS_LAMBDA_FUNCTION_NAME) {
    app.use('*', cors({ origin: '*' }))
}

app
    .route("/api/certificate", certificate)
    .route("/api/issuer", issuer)
    .route("/api/template", template)
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
