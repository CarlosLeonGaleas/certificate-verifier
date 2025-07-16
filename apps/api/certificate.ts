// import { zValidator } from '@hono/zod-validator'
import { Hono } from 'hono'
import { Certificate, Examples, loadAcademicCertificateI_ABI, Config, processTransaction } from "@certificate-verifier/core"
import { JsonRpcProvider, Contract } from "ethers";
import { describeRoute } from 'hono-openapi';
import { resolver } from 'hono-openapi/zod';
import { z } from 'zod';
import { ErrorResponses, validator } from './common';

async function loadContract() {
    const provider = new JsonRpcProvider(Config.API_NETWORK_URL);
    const ABI = await loadAcademicCertificateI_ABI();
    let contract = null;
    try {
        contract = new Contract(Config.CONTRACT_ADDRESS, ABI, provider);
    } catch (e) {
        console.error('Error en llamada a contrato:', e);
    }
    return { provider, ABI, contract }
}

const mapResponse = (data: { [key: string]: string }): Certificate.InfoType => {
    const issuedAtData = data["5"];
    console.log("issuedAtData NETO:", issuedAtData);
    //const issuedAtFormated = new Date(issuedAtData * 1000).toISOString();
    const issuedAtFormated = new Date(Number(issuedAtData) * 1000).toLocaleString("es-EC", {
        timeZone: "America/Guayaquil",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    });
    return {
        tokenId: 'N/A', // no viene en la respuesta
        documentId: data["1"] ?? '',
        name: data["0"] ?? '',
        course: data["2"] ?? '',
        description: data["3"] ?? '',
        institution: data["4"] ?? '',
        area: '', // campo faltante
        issueAt: issuedAtFormated ?? '',
        startDate: data["6"] ?? '',
        endDate: '',
        issuedDate: data["7"] ?? '',
        hoursWorked: parseInt(data["8"] ?? '0', 10),
        signatoryName: data["9"] ?? '',
        hash: 'N/A' // campo faltante
    };
};

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
