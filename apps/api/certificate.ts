// import { zValidator } from '@hono/zod-validator'
import { Hono } from 'hono'
import { Certificate, Examples, loadAcademicCertificateI_ABI, Config } from "@certificate-verifier/core"
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
        console.log('Contrato cargado');
    } catch (e) {
        console.error('Error en llamada a contrato:', e);
    }
    return { provider, ABI, contract }
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
            const { provider, contract } = await loadContract();
            const txReceipt = await provider.getTransactionReceipt(hash);
            const block = await provider.getBlock(txReceipt.blockNumber);
            const parseLog = contract.interface.parseLog(txReceipt.logs);

            if (!parseLog) {
                return c.json({
                    type: "not_found",
                    code: "certificate_not_found",
                    message: "The requested certificate could not be found",
                }, 404);
            }
            return c.json({ data: parseLog }, 200)
        })
    .get("/id/:id",
        describeRoute({
            tags: ["Certificate"],
            summary: "Obtener certificado por ID",
            description: "Recupera un certificado específico por su ID.",
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
        validator("param", Certificate.InfoSchema.pick({ id: true })),
        async (c) => {
            const id = c.req.valid("param").id;
            const { contract } = await loadContract();
            const certificate = await contract.getCertificateMetadata(id);

            if (!certificate) {
                return c.json({
                    type: "not_found",
                    code: "certificate_not_found",
                    message: "The requested certificate could not be found",
                }, 404);
            }
            // Convertir cualquier campo que pueda ser BigInt (por precaución)
            const certificateSanitized = Object.fromEntries(
                Object.entries(certificate).map(([key, value]) => [
                    key,
                    typeof value === "bigint" ? value.toString() : value,
                ])
            );

            return c.json({ data: certificateSanitized }, 200);
        })
