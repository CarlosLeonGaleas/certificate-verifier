import { ethers } from "ethers";
import { Config } from "@certificate-verifier/core"
import * as fs from "fs";

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
    async getCompleteInfoFromTxHash(txHash: string): Promise<CompleteResult> {
        try {
            console.log("🚀 Starting certificate retrieval process...\n");

            // Step 1: Get Token ID from transaction hash
            const { tokenId, basicInfo, receipt } = await this.getTokenIdFromTxHash(txHash);

            // Step 2: Get complete certificate data
            const fullData = await this.getCertificateData(tokenId);

            // Return complete information
            const result: CompleteResult = {
                transactionInfo: {
                    hash: txHash,
                    blockNumber: receipt.blockNumber,
                    gasUsed: receipt.gasUsed.toString()
                },
                certificateData: fullData
            };

            console.log(`\n🎉 Certificate retrieval completed successfully!`);

            return result;

        } catch (error) {
            console.error(`💥 Certificate retrieval failed:`, (error as Error).message);
            throw error;
        }
    }

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

// Improved main function that accepts transaction hash as parameter
export async function processTransaction(txHash: string): Promise<CompleteResult> {
    const retriever = new CertificateRetriever();

    try {
        console.log(`🎯 Processing transaction: ${txHash}\n`);

        // Get complete information from transaction hash
        const result = await retriever.getCompleteInfoFromTxHash(txHash);

        // Verify the certificate
        const { certificateData } = result;
        const isValid = await retriever.verifyCertificate(
            certificateData.tokenId,
            certificateData.name,
            certificateData.documentId,
            certificateData.course,
            certificateData.institution
        );

        // Add verification result to the result
        result.verificationResult = isValid;

        // Save to file
        const fileName = `certificate-${certificateData.tokenId}.json`;
        fs.writeFileSync(fileName, JSON.stringify(result, null, 2));

        console.log(`\n💾 Certificate data saved to ${fileName}`);

        // Print summary
        console.log(`\n📊 SUMMARY:`);
        console.log(`   Token ID: ${certificateData.tokenId}`);
        console.log(`   Student: ${certificateData.name}`);
        console.log(`   Course: ${certificateData.course}`);
        console.log(`   Institution: ${certificateData.institution}`);
        console.log(`   Verification: ${isValid ? '✅ VALID' : '❌ INVALID'}`);

        return result;

    } catch (error) {
        console.error("❌ Error processing transaction:", (error as Error).message);
        throw error;
    }
}

// Function to get data directly from token ID
export async function getDataFromTokenId(tokenId: number): Promise<CertificateMetadata> {
    const retriever = new CertificateRetriever();

    try {
        console.log(`🎯 Getting data for Token ID: ${tokenId}\n`);

        const certificateData = await retriever.getCertificateData(tokenId);

        // Save to file
        const fileName = `certificate-${tokenId}.json`;
        fs.writeFileSync(fileName, JSON.stringify(certificateData, null, 2));

        console.log(`\n💾 Certificate data saved to ${fileName}`);
        console.log("✅ Certificate data retrieved successfully!");

        return certificateData;
    } catch (error) {
        console.error("❌ Error getting certificate data:", (error as Error).message);
        throw error;
    }
}

// Function to process multiple transaction hashes
export async function processBatchTransactions(txHashes: string[]): Promise<BatchResult[]> {
    const retriever = new CertificateRetriever();
    const results: BatchResult[] = [];

    console.log(`🚀 Processing ${txHashes.length} transactions...\n`);

    for (let i = 0; i < txHashes.length; i++) {
        try {
            console.log(`📦 Processing transaction ${i + 1}/${txHashes.length}: ${txHashes[i]}`);
            const result = await processTransaction(txHashes[i]);
            results.push(result);

            // Add delay between transactions to avoid overwhelming the RPC
            if (i < txHashes.length - 1) {
                console.log("⏳ Waiting 1 second before next transaction...\n");
                await new Promise(resolve => setTimeout(resolve, 1000));
            }

        } catch (error) {
            console.error(`Failed to process ${txHashes[i]}:`, (error as Error).message);
            results.push({ error: (error as Error).message, txHash: txHashes[i] });
        }
    }

    // Save batch results
    const batchFileName = `batch-results-${Date.now()}.json`;
    fs.writeFileSync(batchFileName, JSON.stringify(results, null, 2));

    console.log(`\n📊 BATCH SUMMARY:`);
    console.log(`   Total processed: ${txHashes.length}`);
    console.log(`   Successful: ${results.filter(r => !r.error).length}`);
    console.log(`   Failed: ${results.filter(r => r.error).length}`);
    console.log(`   Results saved to: ${batchFileName}`);

    return results;
}

// Command line interface
export function showUsage(): void {
    console.log("🎓 CERTIFICATE RETRIEVAL TOOL");
    console.log("============================");
    console.log("Usage:");
    console.log("  npx ts-node certificate-retriever.ts <transaction_hash>");
    console.log("  npx ts-node certificate-retriever.ts --token <token_id>");
    console.log("  npx ts-node certificate-retriever.ts --batch <hash1> <hash2> <hash3>");
    console.log("");
    console.log("Examples:");
    console.log("  npx ts-node certificate-retriever.ts 0x73e66fdfeec12b31162cbd41acf1c25881cf1442ff33d7844a9005b977929365");
    console.log("  npx ts-node certificate-retriever.ts --token 1");
    console.log("  npx ts-node certificate-retriever.ts --batch 0x123... 0x456... 0x789...");
}

// Main execution logic
export async function main(): Promise<void> {
    const args = process.argv.slice(2);

    if (args.length === 0) {
        showUsage();
        return;
    }

    try {
        if (args[0] === '--token') {
            // Get data by token ID
            if (args.length < 2) {
                console.log("❌ Please provide a token ID");
                console.log("Example: npx ts-node certificate-retriever.ts --token 1");
                return;
            }

            const tokenId = parseInt(args[1]);
            if (isNaN(tokenId)) {
                console.log("❌ Token ID must be a number");
                return;
            }

            await getDataFromTokenId(tokenId);

        } else if (args[0] === '--batch') {
            // Process multiple transaction hashes
            if (args.length < 2) {
                console.log("❌ Please provide at least one transaction hash");
                console.log("Example: npx ts-node certificate-retriever.ts --batch 0x123... 0x456...");
                return;
            }

            const txHashes = args.slice(1);
            await processBatchTransactions(txHashes);

        } else {
            // Process single transaction hash
            const txHash = args[0];

            if (!txHash.startsWith('0x') || txHash.length !== 66) {
                console.log("❌ Invalid transaction hash format");
                console.log("Transaction hash should start with 0x and be 66 characters long");
                return;
            }

            await processTransaction(txHash);
        }

    } catch (error) {
        console.error("💥 Application error:", (error as Error).message);
        process.exit(1);
    }
}
