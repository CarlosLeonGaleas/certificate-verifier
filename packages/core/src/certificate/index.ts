import { z } from "zod";
import { Examples } from "../examples";
import { ethers } from "ethers";
import { Config } from "@certificate-verifier/core"
import * as fs from "fs";

export namespace Certificate {
    /*
    export const InfoSchema = z
        .object({
            id: z.string().openapi({
                description: "ID of the cetificate on the contract",
                example: Examples.Certificate.id,
            }),
            documentIdentification: z.string().openapi({
                description: "Document Identification of the beneficiary of the certificate",
                example: Examples.Certificate.documentIdentification,
            }),
            name: z.string().openapi({
                description: "Name of the person receiving the certificate",
                example: Examples.Certificate.name,
            }),
            course: z.string().openapi({
                description: "Name of the type, tittle and background of the course",
                example: Examples.Certificate.course,
            }),
            description: z.string().openapi({
                description: "Description of the certificate (this is visible on the certificate)",
                example: Examples.Certificate.description,
            }),
            institution: z.string().url().nullish().openapi({
                description: "Name of the institution where the certificate was issued",
                example: Examples.Certificate.institution,
            }),
            area: z.string().openapi({
                description: "Area of the institution where the certificate was issued",
                example: Examples.Certificate.area,
            }),
            startDate: z.string().openapi({
                description: "Start date of the certificate",
                example: Examples.Certificate.startDate,
            }),
            endDate: z.string().openapi({
                description: "End date of the certificate",
                example: Examples.Certificate.endDate,
            }),
            issueDate: z.string().openapi({
                description: "Date of issue of the certificate",
                example: Examples.Certificate.issueDate,
            }),
            hoursWorked: z.number().openapi({
                description: "Number of hours worked",
                example: Examples.Certificate.hoursWorked,
            }),
            signatoryName: z.string().openapi({
                description: "Name of the signatory",
                example: Examples.Certificate.signatoryName,
            }),
        })
        .openapi({
            ref: "Certificate",
            description: "A collection of certificates",
            example: Examples.Certificate,
        });
    */
    export const InfoSchema = z.object({
        tokenId: z.string(),
        name: z.string(),
        documentId: z.string(),
        course: z.string(),
        description: z.string(),
        institution: z.string(),
        area: z.string(),
        issuedDate: z.string(),
        startDate: z.string(),
        endDate: z.string(),
        hoursWorked: z.number(),
        signatoryName: z.string(),
        hash: z.string(),
        issueAt: z.string(),
    })
    export type InfoType = z.infer<typeof InfoSchema>

    // Interfaces and Types
    interface Config {
        CONTRACT_ADDRESS: string;
        API_NETWORK_URL: string;
        PRIVATE_KEY: string;
    }

    interface CertificateEventArgs {
        tokenId: bigint;
        studentHash: string;
        institutionHash: string;
        name: string;
        documentId: string;
        course: string;
        institution: string;
    }

    interface BasicCertificateInfo {
        tokenId: string;
        name: string;
        documentId: string;
        course: string;
        institution: string;
    }

    interface CertificateMetadata {
        tokenId: string;
        name: string;
        documentId: string;
        course: string;
        description: string;
        institution: string;
        area: string;
        issuedDate: string;
        startDate: string;
        endDate: string;
        hoursWorked: string;
        signatoryName: string;
    }

    interface TransactionInfo {
        hash: string;
        blockNumber: number;
        gasUsed: string;
    }

    interface TokenIdResult {
        tokenId: string;
        basicInfo: BasicCertificateInfo;
        receipt: ethers.TransactionReceipt;
    }

    interface CompleteResult {
        transactionInfo: TransactionInfo;
        certificateData: CertificateMetadata;
        verificationResult?: boolean;
    }

    interface BatchResult {
        error?: string;
        txHash?: string;
        transactionInfo?: TransactionInfo;
        certificateData?: CertificateMetadata;
        verificationResult?: boolean;
    }

    // Complete Contract ABI for reading data
    const CONTRACT_ABI = [
        // Event for getting token ID
        {
            "anonymous": false,
            "inputs": [
                { "indexed": true, "internalType": "uint256", "name": "tokenId", "type": "uint256" },
                { "indexed": true, "internalType": "bytes32", "name": "studentHash", "type": "bytes32" },
                { "indexed": true, "internalType": "bytes32", "name": "institutionHash", "type": "bytes32" },
                { "indexed": false, "internalType": "string", "name": "name", "type": "string" },
                { "indexed": false, "internalType": "string", "name": "documentId", "type": "string" },
                { "indexed": false, "internalType": "string", "name": "course", "type": "string" },
                { "indexed": false, "internalType": "string", "name": "institution", "type": "string" }
            ],
            "name": "CertificateIssued",
            "type": "event"
        },
        // Function to get all certificate metadata
        {
            "inputs": [{ "internalType": "uint256", "name": "_tokenId", "type": "uint256" }],
            "name": "getCertificateMetadata",
            "outputs": [
                { "internalType": "string", "name": "name", "type": "string" },
                { "internalType": "string", "name": "documentId", "type": "string" },
                { "internalType": "string", "name": "course", "type": "string" },
                { "internalType": "string", "name": "description", "type": "string" },
                { "internalType": "string", "name": "institution", "type": "string" },
                { "internalType": "string", "name": "area", "type": "string" },
                { "internalType": "string", "name": "issuedDate", "type": "string" },
                { "internalType": "string", "name": "startDate", "type": "string" },
                { "internalType": "string", "name": "endDate", "type": "string" },
                { "internalType": "uint256", "name": "hoursWorked", "type": "uint256" },
                { "internalType": "string", "name": "signatoryName", "type": "string" }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        // Function to verify certificate
        {
            "inputs": [
                { "internalType": "uint256", "name": "_tokenId", "type": "uint256" },
                { "internalType": "string", "name": "_name", "type": "string" },
                { "internalType": "string", "name": "_documentId", "type": "string" },
                { "internalType": "string", "name": "_course", "type": "string" },
                { "internalType": "string", "name": "_institution", "type": "string" }
            ],
            "name": "verifyCertificate",
            "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
            "stateMutability": "view",
            "type": "function"
        }
    ] as const;

    export class CertificateRetriever {
        private provider: ethers.JsonRpcProvider;
        private contract: ethers.Contract;

        constructor() {
            this.provider = new ethers.JsonRpcProvider(Config.API_NETWORK_URL);
            this.contract = new ethers.Contract(Config.CONTRACT_ADDRESS, CONTRACT_ABI, this.provider);
        }

        /**
         * Step 1: Get Token ID from Transaction Hash
         */
        async getTokenIdFromTxHash(txHash: string): Promise<TokenIdResult> {
            try {
                console.log(`🔍 Looking up transaction: ${txHash}`);

                // Get transaction receipt
                const receipt = await this.provider.getTransactionReceipt(txHash);

                if (!receipt) {
                    throw new Error("Transaction not found or not mined yet");
                }

                console.log(`✅ Transaction found in block: ${receipt.blockNumber}`);

                // Parse events from the receipt
                const parsedLogs = receipt.logs.map(log => {
                    try {
                        return this.contract.interface.parseLog(log);
                    } catch (error) {
                        return null; // Skip logs that don't match our contract
                    }
                }).filter(log => log !== null);

                // Find the CertificateIssued event
                const certificateEvent = parsedLogs.find(log => log && log.name === 'CertificateIssued');

                if (!certificateEvent) {
                    throw new Error("No CertificateIssued event found in transaction");
                }

                // Extract token ID and basic info from event
                const tokenId = certificateEvent.args.tokenId.toString();
                const basicInfo: BasicCertificateInfo = {
                    tokenId: tokenId,
                    name: certificateEvent.args.name,
                    documentId: certificateEvent.args.documentId,
                    course: certificateEvent.args.course,
                    institution: certificateEvent.args.institution
                };

                console.log(`🎯 Token ID found: ${tokenId}`);
                console.log(`👤 Student: ${basicInfo.name}`);
                console.log(`📄 Document ID: ${basicInfo.documentId}`);
                console.log(`📚 Course: ${basicInfo.course}`);

                return { tokenId, basicInfo, receipt };

            } catch (error) {
                console.error(`❌ Error getting token ID from transaction:`, (error as Error).message);
                throw error;
            }
        }

        /**
         * Step 2: Get Complete Certificate Data from Token ID
         */
        async getCertificateData(tokenId: string | number): Promise<CertificateMetadata> {
            try {
                console.log(`\n📋 Retrieving complete data for Token ID: ${tokenId}`);

                // Call the contract function to get all metadata
                const metadata = await this.contract.getCertificateMetadata(tokenId);
                console.log("METADATA:", metadata);

                // Structure the complete certificate data
                const certificateData: CertificateMetadata = {
                    tokenId: tokenId.toString(),
                    name: metadata[0],
                    documentId: metadata[1],
                    course: metadata[2],
                    description: metadata[3],
                    institution: metadata[4],
                    area: metadata[5],
                    issuedDate: metadata[6],
                    startDate: metadata[7],
                    endDate: metadata[8],
                    hoursWorked: metadata[9].toString(),
                    signatoryName: metadata[10]
                };

                console.log(`✅ Complete certificate data retrieved:`);
                console.log(`   Name: ${certificateData.name}`);
                console.log(`   Document ID: ${certificateData.documentId}`);
                console.log(`   Course: ${certificateData.course}`);
                console.log(`   Description: ${certificateData.description}`);
                console.log(`   Institution: ${certificateData.institution}`);
                console.log(`   Area: ${certificateData.area}`);
                console.log(`   Issued Date: ${certificateData.issuedDate}`);
                console.log(`   Study Period: ${certificateData.startDate} - ${certificateData.endDate}`);
                console.log(`   Hours Worked: ${certificateData.hoursWorked}`);
                console.log(`   Signatory: ${certificateData.signatoryName}`);

                return certificateData;

            } catch (error) {
                console.error(`❌ Error getting certificate data:`, (error as Error).message);
                throw error;
            }
        }

        /**
         * Complete workflow: Transaction Hash → Token ID → Full Certificate Data
         */
        async getCompleteInfoFromTxHash(txHash: string): Promise<InfoType> {
            try {
                console.log("🚀 Starting certificate retrieval process...\n");

                // Step 1: Get Token ID from transaction hash
                const { tokenId, basicInfo, receipt } = await this.getTokenIdFromTxHash(txHash);

                const block = await this.provider.getBlock(receipt.blockNumber);

                // Step 2: Get complete certificate data
                const fullData = await this.getCertificateData(tokenId);

                // Return complete information
                // const result: CompleteResult = {
                //     transactionInfo: {
                //         hash: txHash,
                //         blockNumber: receipt.blockNumber,
                //         gasUsed: receipt.gasUsed.toString()
                //     },
                //     certificateData: fullData
                // };

                const timestamp = block.timestamp;
                const date = new Date(timestamp * 1000); // Convertir a milisegundos

                // Return complete information
                const result: InfoType = {
                    tokenId: fullData.tokenId,
                    name: fullData.name,
                    documentId: fullData.documentId,
                    course: fullData.course,
                    description: fullData.description,
                    institution: fullData.institution,
                    area: fullData.area,
                    issuedDate: fullData.issuedDate,
                    startDate: fullData.startDate,
                    endDate: fullData.endDate,
                    hoursWorked: parseInt(fullData.hoursWorked),
                    signatoryName: fullData.signatoryName,
                    hash: txHash,
                    issueAt: date.toLocaleString(),
                };

                console.log(`\n🎉 Certificate retrieval completed successfully!`);

                return result;

            } catch (error) {
                console.error(`💥 Certificate retrieval failed:`, (error as Error).message);
                throw error;
            }
        }

        /**
         * Optimized version: Get complete certificate info from Token ID
         * This version uses a more efficient search strategy
         */
        async getCompleteInfoFromTokenIdOptimized(tokenId: string | number): Promise<InfoType> {
            try {
                console.log(`🚀 Starting optimized certificate retrieval from Token ID: ${tokenId}...\n`);

                // Step 1: Get complete certificate data from contract
                const fullData = await this.getCertificateData(tokenId);

                // Step 2: Search for the event more efficiently
                console.log(`🔍 Searching for CertificateIssued event for Token ID: ${tokenId}`);

                // Try to get recent events first (most certificates are likely recent)
                const currentBlock = await this.provider.getBlockNumber();
                const searchRanges = [
                    { from: Math.max(0, currentBlock - 500), to: currentBlock },    // Last ~100k blocks
                    { from: Math.max(0, currentBlock - 500), to: currentBlock - 500 }, // Previous 400k blocks
                    { from: 0, to: currentBlock - 500 }  // Everything else
                ];

                let txHash: string | null = null;
                let blockNumber: number | null = null;

                for (const range of searchRanges) {
                    if (range.from >= range.to) continue;

                    console.log(`   Searching blocks ${range.from} to ${range.to}...`);

                    try {
                        const filter = this.contract.filters.CertificateIssued(tokenId);
                        const events = await this.contract.queryFilter(filter, range.from, range.to);

                        if (events.length > 0) {
                            const event = events[0];
                            txHash = event.transactionHash;
                            blockNumber = event.blockNumber;

                            console.log(`✅ Found CertificateIssued event:`);
                            console.log(`   Transaction Hash: ${txHash}`);
                            console.log(`   Block Number: ${blockNumber}`);
                            break;
                        }
                    } catch (error) {
                        console.log(`   Error searching range ${range.from}-${range.to}:`, (error as Error).message);
                        continue;
                    }
                }

                if (!txHash || !blockNumber) {
                    throw new Error(`No CertificateIssued event found for Token ID: ${tokenId}`);
                }

                // Step 3: Get block timestamp
                const block = await this.provider.getBlock(blockNumber);
                const timestamp = block.timestamp;
                const date = new Date(timestamp * 1000);

                // Step 4: Create complete result
                const result: InfoType = {
                    tokenId: fullData.tokenId,
                    name: fullData.name,
                    documentId: fullData.documentId,
                    course: fullData.course,
                    description: fullData.description,
                    institution: fullData.institution,
                    area: fullData.area,
                    issuedDate: fullData.issuedDate,
                    startDate: fullData.startDate,
                    endDate: fullData.endDate,
                    hoursWorked: parseInt(fullData.hoursWorked),
                    signatoryName: fullData.signatoryName,
                    hash: txHash,
                    issueAt: date.toLocaleString(),
                };

                console.log(`\n🎉 Certificate retrieval from Token ID completed successfully!`);

                return result;

            } catch (error) {
                console.error(`💥 Certificate retrieval from Token ID failed:`, (error as Error).message);
                throw error;
            }
        }

        /**
         * Paso A: Token ID -> Transaction Hash
         */
        async findTxHashByTokenIdPaged(
            contract: ethers.Contract,
            tokenId: string | number,
            fromBlock: number,
            toBlock: number
        ): Promise<string> {
            const tokenIdBig = BigInt(tokenId);
            const filter = contract.filters.CertificateIssued(tokenIdBig);

            const batchSize = 500;
            let currentBlock = fromBlock;

            while (currentBlock <= toBlock) {
                const endBlock = Math.min(currentBlock + batchSize - 1, toBlock);

                try {
                    const logs = await contract.queryFilter(filter, currentBlock, endBlock);

                    if (logs.length > 0) {
                        return logs[0].transactionHash;
                    }
                } catch (err) {
                    console.error(`Error fetching logs from ${currentBlock} to ${endBlock}`, err);
                }

                currentBlock += batchSize;
            }

            throw new Error(`No se encontró un evento CertificateIssued para tokenId=${tokenId}`);
        }

        // async getCompleteInfoFromTokenId(tokenId: string): Promise<InfoType> {
        //     try {
        //         console.log("🚀 Starting certificate retrieval process...\n");

        //         const tokenIdBig = BigInt(tokenId);

        //         // Step 1: Get complete certificate data
        //         const fullData = await this.getCertificateData(tokenId);

        //         // TESTING
        //         const filter = this.contract.filters.CertificateIssued(tokenIdBig, fullData.name, fullData.documentId, fullData.course, fullData.institution);
        //         // const filter = this.contract.filters.CertificateIssued(null, null, null, null);
        //         const events = await this.contract.queryFilter(filter);

        //         // Find the event that corresponds to this token ID
        //         const event = events.find(e => {
        //             try {
        //                 return parseInt(e.args.tokenId) === tokenId;
        //             } catch {
        //                 return false;
        //             }
        //         });

        //         let timestamp = null;
        //         let block = null;
        //         if (event) {
        //             block = await this.provider.getBlock(event.blockNumber);
        //             timestamp = block.timestamp;
        //         }

        //         console.log("TIMESTAMP:", timestamp)
        //         console.log("BLOCK:", block)

        //         // Step 2: Get Hash from TokenId
        //         const txHash = await this.findTxHashByTokenIdPaged(this.contract, tokenId, block, await this.provider.getBlockNumber());
        //         console.log("TX HASH:", txHash)

        //         const { receipt } = await this.getTokenIdFromTxHash(txHash);

        //         // const block = await this.provider.getBlock(receipt.blockNumber);

        //         // const timestamp = block.timestamp;
        //         const date = new Date(timestamp * 1000); // Convertir a milisegundos

        //         // Return complete information
        //         const result: InfoType = {
        //             tokenId: tokenId,
        //             name: fullData.name,
        //             documentId: fullData.documentId,
        //             course: fullData.course,
        //             description: fullData.description,
        //             institution: fullData.institution,
        //             area: fullData.area,
        //             issuedDate: fullData.issuedDate,
        //             startDate: fullData.startDate,
        //             endDate: fullData.endDate,
        //             hoursWorked: parseInt(fullData.hoursWorked),
        //             signatoryName: fullData.signatoryName,
        //             hash: txHash.toString(),
        //             issueAt: date.toLocaleString(),
        //         };

        //         console.log(`\n🎉 Certificate retrieval completed successfully!`);

        //         return result;

        //     } catch (error) {
        //         console.error(`💥 Certificate retrieval failed:`, (error as Error).message);
        //         throw error;
        //     }
        // }

        /**
         * Verify certificate using the retrieved data
         */
        async verifyCertificate(
            tokenId: string | number,
            name: string,
            documentId: string,
            course: string,
            institution: string
        ): Promise<boolean> {
            try {
                console.log(`\n🔍 Verifying certificate...`);

                const isValid = await this.contract.verifyCertificate(
                    tokenId, name, documentId, course, institution
                );

                console.log(`🔐 Verification result: ${isValid ? '✅ VALID' : '❌ INVALID'}`);

                return isValid;

            } catch (error) {
                console.error(`❌ Verification failed:`, (error as Error).message);
                return false;
            }
        }
    }
}