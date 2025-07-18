// import { zValidator } from '@hono/zod-validator'
import { Hono } from 'hono'
import { Certificate, Examples } from "@certificate-verifier/core"
import { describeRoute } from 'hono-openapi';
import { resolver } from 'hono-openapi/zod';
import { z } from 'zod';
import { ErrorResponses, validator } from './common';

function stringifyBigInts(obj: any): any {
    if (typeof obj === 'bigint') {
        return obj.toString();
    } else if (Array.isArray(obj)) {
        return obj.map(stringifyBigInts);
    } else if (typeof obj === 'object' && obj !== null) {
        const newObj: any = {};
        for (const key in obj) {
            newObj[key] = stringifyBigInts(obj[key]);
        }
        return newObj;
    }
    return obj;
}

export const certificate = new Hono()
    .get('/hash/:hash',
        describeRoute(
            {
                tags: ["Certificate"],
                summary: "Buscar el certificado por el Hash de la transacción",
                description: "Muestra toda la información en la blockchain del certificado",
                responses: {
                    200: {
                        content: {
                            "application/json": {
                                schema: resolver(z.object({
                                    data: Certificate.InfoSchema.array().openapi({
                                        description: "Información del certificado",
                                        example: [Examples.Certificate]
                                    })
                                })),
                                example: {
                                    data: [Examples.Certificate]
                                }
                            }
                        },
                        description: "Información del certificado",
                    },
                    500: ErrorResponses[500],
                }
            }
        ),
        validator("param", Certificate.InfoSchema.pick({ hash: true })),
        async (c) => {
            const hash = c.req.valid("param").hash;
            const retriever = new Certificate.CertificateRetriever();

            const certificateData = await retriever.getCompleteInfoFromTxHash(hash);

            if (!certificateData) {
                return c.json({
                    type: "not_found",
                    code: "certificate_not_found",
                    message: "The requested certificate could not be found",
                }, 404);
            };

            return c.json({ data: certificateData }, 200)
        })
    .get("/id/:tokenId",
        describeRoute({
            tags: ["Certificate"],
            summary: "Obtener certificado por Token ID",
            description: "Recupera un certificado específico por su Token ID.",
            responses: {
                200: {
                    description: "Respuesta exitosa",
                    content: {
                        "application/json": {
                            schema: resolver(z.object({
                                data: Certificate.InfoSchema
                            })),
                            example: { data: Examples.Certificate },
                        },
                    },
                },
                400: ErrorResponses[400],
                404: ErrorResponses[404],
                500: ErrorResponses[500],
            }
        }),
        validator("param", Certificate.InfoSchema.pick({ tokenId: true })),
        async (c) => {
            const tokenId = c.req.valid("param").tokenId;
            const retriever = new Certificate.CertificateRetriever();

            const certificateData = await retriever.getCertificateData(tokenId);

            if (!certificateData) {
                return c.json({
                    type: "not_found",
                    code: "certificate_not_found",
                    message: "The requested certificate could not be found",
                }, 404);
            }

            return c.json({ data: certificateData }, 200)
        })
    .get("/documentId/count/:documentId",
        describeRoute({
            tags: ["Certificate"],
            summary: "Obtener la cantidad de certificados por Document ID (Cédula de Identidad)",
            description: "Recupera la cantidad de certificados específicos de un Document ID.",
            responses: {
                200: {
                    description: "Respuesta exitosa",
                    content: {
                        "application/json": {
                            schema: resolver(z.object({
                                data: Certificate.InfoSchema
                            })),
                            example: { data: Examples.Certificate },
                        },
                    },
                },
                400: ErrorResponses[400],
                404: ErrorResponses[404],
                500: ErrorResponses[500],
            }
        }),
        validator("param", Certificate.InfoSchema.pick({ documentId: true })),
        async (c) => {
            const documentId = c.req.valid("param").documentId;
            const retriever = new Certificate.CertificateRetriever();

            const certificatesCount = await retriever.getCertificatesCountFromDocumentId(documentId);

            if (!certificatesCount) {
                return c.json({
                    type: "not_found",
                    code: "certificate_not_found",
                    message: "The requested certificate could not be found",
                }, 404);
            }

            return c.json({ data: certificatesCount }, 200)
        })
    .get("/documentId/certificates/:documentId",
        describeRoute({
            tags: ["Certificate"],
            summary: "Obtener la data de los certificados por Document ID (Cédula de Identidad)",
            description: "Recupera la data de los certificados de un Document ID.",
            responses: {
                200: {
                    description: "Respuesta exitosa",
                    content: {
                        "application/json": {
                            schema: resolver(z.object({
                                data: Certificate.InfoSchema
                            })),
                            example: { data: Examples.Certificate },
                        },
                    },
                },
                400: ErrorResponses[400],
                404: ErrorResponses[404],
                500: ErrorResponses[500],
            }
        }),
        validator("param", Certificate.InfoSchema.pick({ documentId: true })),
        async (c) => {
            const documentId = c.req.valid("param").documentId;
            const retriever = new Certificate.CertificateRetriever();

            const certificatesData = await retriever.getCertificateDataFromDocumentId(documentId);
            console.log("certificatesData:", certificatesData);

            if (!certificatesData) {
                return c.json({
                    type: "not_found",
                    code: "certificate_not_found",
                    message: "The requested certificate could not be found",
                }, 404);
            }

            return c.json({ data: stringifyBigInts(certificatesData) }, 200)
        })
// .get('/migrate',
//     describeRoute(
//         {
//             tags: ["Certificate"],
//             summary: "Migrar los certificados a la blockan desde el csv",
//             description: "Genera un json con los datos de los certificados migrados",
//             responses: {
//                 200: {
//                     content: {
//                         "application/json": {
//                             schema: resolver(z.object({
//                                 data: Certificate.InfoSchema.array().openapi({
//                                     description: "Información del certificado",
//                                     example: [Examples.Certificate]
//                                 })
//                             })),
//                             example: {
//                                 data: [Examples.Certificate]
//                             }
//                         }
//                     },
//                     description: "Información del certificado",
//                 },
//                 500: ErrorResponses[500],
//             }
//         }
//     ),
//     async (c) => {
//         RunMigration2();
//         return c.json({ data: "Revise el procesamiento de migración en la consola" }, 200)
//     })
