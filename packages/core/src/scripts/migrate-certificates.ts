const fs = require("fs");
const csv = require("csv-parser");
const { ethers } = require("ethers");
import { Config } from "@certificate-verifier/core"

// Interfaces and Types
interface ConfigType {
    RPC_URL: string;
    CONTRACT_ADDRESS: string;
    PRIVATE_KEY: string;
    CSV_FILE_PATH: string;
    BATCH_SIZE: number;
    DELAY_BETWEEN_BATCHES: number;
    GAS_LIMIT: number;
    GAS_PRICE: string;
}

interface CertificateData {
    name: string;
    documentId: string;
    course: string;
    description: string;
    institution: string;
    area: string;
    issuedDate: string;
    startDate: string;
    endDate: string;
    hoursWorked: number;
    signatoryName: string;
}

interface CSVRow {
    [key: string]: string;
    name?: string;
    Name?: string;
    documentId?: string;
    document_id?: string;
    DocumentId?: string;
    course?: string;
    Course?: string;
    description?: string;
    Description?: string;
    institution?: string;
    Institution?: string;
    area?: string;
    Area?: string;
    issuedDate?: string;
    issued_date?: string;
    IssuedDate?: string;
    startDate?: string;
    start_date?: string;
    StartDate?: string;
    endDate?: string;
    end_date?: string;
    EndDate?: string;
    hoursWorked?: string;
    hours_worked?: string;
    HoursWorked?: string;
    signatoryName?: string;
    signatory_name?: string;
    SignatoryName?: string;
}

interface SuccessResult {
    index: number;
    name: string;
    documentId: string;
    txHash: string;
    tokenId?: string;
}

interface FailedResult {
    index: number;
    name: string;
    documentId: string;
    error: string;
}

interface MigrationResults {
    success: SuccessResult[];
    failed: FailedResult[];
    total: number;
}

interface IssuanceResult {
    success: boolean;
    txHash?: string;
    error?: string;
}

// Configuration
const CONFIG: ConfigType = {
    RPC_URL: Config.API_NETWORK_URL,
    CONTRACT_ADDRESS: Config.CONTRACT_ADDRESS,
    PRIVATE_KEY: Config.PRIVATE_KEY,
    CSV_FILE_PATH: "./certificados2.csv",
    BATCH_SIZE: 1,
    DELAY_BETWEEN_BATCHES: 2000,
    GAS_LIMIT: 800000,
    GAS_PRICE: "20000000000", // 20 gwei
};

const CONTRACT_ABI = [
    {
        inputs: [
            {
                components: [
                    { internalType: "string", name: "name", type: "string" },
                    { internalType: "string", name: "documentId", type: "string" },
                    { internalType: "string", name: "course", type: "string" },
                    { internalType: "string", name: "description", type: "string" },
                    { internalType: "string", name: "institution", type: "string" },
                    { internalType: "string", name: "area", type: "string" },
                    { internalType: "string", name: "issuedDate", type: "string" },
                    { internalType: "string", name: "startDate", type: "string" },
                    { internalType: "string", name: "endDate", type: "string" },
                    { internalType: "uint256", name: "hoursWorked", type: "uint256" },
                    { internalType: "string", name: "signatoryName", type: "string" },
                ],
                internalType: "struct AcademicCertificate.CertificateIssuanceParams",
                name: "params",
                type: "tuple",
            },
        ],
        name: "issueCertificate",
        outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
        stateMutability: "nonpayable",
        type: "function",
    },
] as const;

export class CertificateMigration {
    private provider: ethers.JsonRpcProvider;
    private wallet: ethers.Wallet;
    private contract: ethers.Contract;
    private certificates: CertificateData[];
    private results: MigrationResults;

    constructor() {
        this.provider = new ethers.JsonRpcProvider(CONFIG.RPC_URL);
        this.wallet = new ethers.Wallet(CONFIG.PRIVATE_KEY, this.provider);
        this.contract = new ethers.Contract(
            CONFIG.CONTRACT_ADDRESS,
            CONTRACT_ABI,
            this.wallet
        );
        this.certificates = [];
        this.results = {
            success: [],
            failed: [],
            total: 0,
        };
    }

    // Read and parse CSV file
    async readCSV(): Promise<CertificateData[]> {
        return new Promise((resolve, reject) => {
            const certificates: CertificateData[] = [];

            fs.createReadStream(CONFIG.CSV_FILE_PATH)
                .pipe(csv({ separator: ';' }))
                .on("data", (row: CSVRow) => {
                    // Map CSV columns to the structure
                    const certificate: CertificateData = {
                        name: row.name || row.Name || "",
                        documentId:
                            row.documentId || row.document_id || row.DocumentId || "",
                        course: row.course || row.Course || "",
                        description: row.description || row.Description || "",
                        institution: row.institution || row.Institution || "",
                        area: row.area || row.Area || "",
                        issuedDate:
                            row.issuedDate || row.issued_date || row.IssuedDate || "",
                        startDate: row.startDate || row.start_date || row.StartDate || "",
                        endDate: row.endDate || row.end_date || row.EndDate || "",
                        hoursWorked: parseInt(
                            row.hoursWorked || row.hours_worked || row.HoursWorked || "0"
                        ),
                        signatoryName:
                            row.signatoryName ||
                            row.signatory_name ||
                            row.SignatoryName ||
                            "",
                    };

                    certificates.push(certificate);
                })
                .on("end", () => {
                    console.log(
                        `✅ CSV file read successfully. Found ${certificates.length} certificates.`
                    );
                    resolve(certificates);
                })
                .on("error", (error: Error) => {
                    console.error("❌ Error reading CSV file:", error);
                    reject(error);
                });
        });
    }

    // Validate certificate data
    validateCertificate(cert: CertificateData, index: number): boolean {
        const required: (keyof CertificateData)[] = ["name", "documentId", "course", "institution"];
        const missing = required.filter(
            (field) => !cert[field] || cert[field].toString().trim() === ""
        );

        if (missing.length > 0) {
            console.warn(
                `⚠️  Certificate ${index + 1} missing required fields: ${missing.join(
                    ", "
                )}`
            );
            return false;
        }

        return true;
    }

    // Issue a single certificate
    async issueSingleCertificate(cert: CertificateData, index: number): Promise<IssuanceResult> {
        try {
            console.log(`📝 Issuing certificate ${index + 1} for ${cert.name}...`);
            const estimatedGas = await this.contract.issueCertificate.estimateGas(cert);
            console.log('Estimated Gas:', ethers.formatEther(estimatedGas));
            const fee = await this.provider.getFeeData();

            const tx = await this.contract.issueCertificate(cert, {
                gasLimit: CONFIG.GAS_LIMIT,
                gasPrice: CONFIG.GAS_PRICE,
            });

            console.log(`⏳ Transaction sent: ${tx.hash}`);
            const receipt = await tx.wait();

            // Extract token ID from receipt logs
            let tokenId: string | undefined;
            if (receipt && receipt.logs && receipt.logs.length > 0) {
                tokenId = receipt.logs[0]?.topics?.[1];
            }

            console.log(
                `✅ Certificate ${index + 1} issued successfully. Token ID: ${tokenId || 'N/A'}`
            );

            this.results.success.push({
                index: index + 1,
                name: cert.name,
                documentId: cert.documentId,
                txHash: tx.hash,
                tokenId: tokenId,
            });

            return { success: true, txHash: tx.hash };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error(
                `❌ Failed to issue certificate ${index + 1} for ${cert.name}:`,
                errorMessage
            );

            this.results.failed.push({
                index: index + 1,
                name: cert.name,
                documentId: cert.documentId,
                error: errorMessage,
            });

            return { success: false, error: errorMessage };
        }
    }

    // Process certificates in batches
    async processBatches(): Promise<void> {
        const validCertificates = this.certificates.filter((cert, index) =>
            this.validateCertificate(cert, index)
        );

        console.log(
            `\n🚀 Starting migration of ${validCertificates.length} valid certificates...`
        );
        console.log(`📦 Processing in batches of ${CONFIG.BATCH_SIZE}\n`);

        for (let i = 0; i < validCertificates.length; i += CONFIG.BATCH_SIZE) {
            const batch = validCertificates.slice(i, i + CONFIG.BATCH_SIZE);
            const batchNumber = Math.floor(i / CONFIG.BATCH_SIZE) + 1;

            console.log(
                `\n📦 Processing batch ${batchNumber} (certificates ${i + 1}-${i + batch.length
                })...`
            );

            // Process batch in parallel
            const batchPromises = batch.map((cert, batchIndex) =>
                this.issueSingleCertificate(cert, i + batchIndex)
            );

            await Promise.all(batchPromises);

            // Delay between batches to avoid overwhelming the network
            if (i + CONFIG.BATCH_SIZE < validCertificates.length) {
                console.log(
                    `⏳ Waiting ${CONFIG.DELAY_BETWEEN_BATCHES / 1000
                    }s before next batch...`
                );
                await new Promise((resolve) =>
                    setTimeout(resolve, CONFIG.DELAY_BETWEEN_BATCHES)
                );
            }
        }
    }

    // Generate migration report
    generateReport(): void {
        const report = `
🎯 MIGRATION REPORT
==================
Total certificates processed: ${this.results.total}
✅ Successfully issued: ${this.results.success.length}
❌ Failed: ${this.results.failed.length}

SUCCESSFUL CERTIFICATES:
${this.results.success
                .map((cert) => `- ${cert.name} (${cert.documentId}) - TX: ${cert.txHash}`)
                .join("\n")}

${this.results.failed.length > 0
                ? `
FAILED CERTIFICATES:
${this.results.failed
                    .map((cert) => `- ${cert.name} (${cert.documentId}) - Error: ${cert.error}`)
                    .join("\n")}
`
                : ""
            }
`;

        console.log(report);

        // Save report to file
        fs.writeFileSync("./migration-report.txt", report);
        console.log("\n📄 Report saved to migration-report.txt");
    }

    // Main migration function
    async migrate(): Promise<void> {
        try {
            console.log("🚀 Starting certificate migration...\n");

            // Check wallet balance
            const balance = await this.provider.getBalance(this.wallet.address);
            console.log(`💰 Wallet balance: ${ethers.formatEther(balance)} ETH`);
            console.log(`🔑 Contrato: ${JSON.stringify(this.contract, null, 2)}`);

            if (balance < ethers.parseEther("0.1")) {
                console.warn(
                    "⚠️  Low balance warning! Make sure you have enough ETH for gas fees."
                );
            }

            // Read CSV
            this.certificates = await this.readCSV();
            this.results.total = this.certificates.length;

            if (this.certificates.length === 0) {
                console.log("❌ No certificates found in CSV file.");
                return;
            }

            // Process in batches
            await this.processBatches();

            // Generate report
            this.generateReport();

            console.log("\n🎉 Migration completed!");
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error("💥 Migration failed:", errorMessage);
        }
    }

    // Getter methods for accessing results
    getResults(): MigrationResults {
        return this.results;
    }

    getCertificates(): CertificateData[] {
        return this.certificates;
    }
}

// Validation functions
export function validateConfiguration(): boolean {
    if (!CONFIG.PRIVATE_KEY || CONFIG.PRIVATE_KEY === "0xPrivateKey") {
        console.error("❌ PRIVATE_KEY environment variable not set or using default value!");
        console.log('Set it with: export PRIVATE_KEY="your-private-key"');
        return false;
    }

    if (!fs.existsSync(CONFIG.CSV_FILE_PATH)) {
        console.error(`❌ CSV file not found: ${CONFIG.CSV_FILE_PATH}`);
        return false;
    }

    return true;
}

// Run the migration
export async function RunMigration(): Promise<void> {
    // Validate configuration
    if (!validateConfiguration()) {
        process.exit(1);
    }

    const migration = new CertificateMigration();
    await migration.migrate();
}

// Utility function to create a migration instance with custom config
export function createMigration(customConfig?: Partial<ConfigType>): CertificateMigration {
    if (customConfig) {
        Object.assign(CONFIG, customConfig);
    }
    return new CertificateMigration();
}

// Export types for external use
export type {
    ConfigType,
    CertificateData,
    CSVRow,
    SuccessResult,
    FailedResult,
    MigrationResults,
    IssuanceResult
};

// Export configuration for external access
export { CONFIG };
