const fs = require("fs");
const csv = require("csv-parser");
const { ethers } = require("ethers");
import { Config } from "@certificate-verifier/core";

// Configuration
const CONFIG = {
    RPC_URL: Config.API_NETWORK_URL,
    CONTRACT_ADDRESS: Config.CONTRACT_ADDRESS,
    PRIVATE_KEY: Config.PRIVATE_KEY,
    CSV_FILE_PATH: "./certificados2.csv",
    BATCH_SIZE: 1, 
    DELAY_BETWEEN_BATCHES: 3000, 
    
    GAS_LIMIT: 1200000, 
    MAX_FEE_PER_GAS: "150000000000", 
    MAX_PRIORITY_FEE_PER_GAS: "50000000000", 
    
    GAS_PRICE: "100000000000", // 100 gwei 
    
    MAX_RETRIES: 3,
    RETRY_DELAY: 5000,
    TIMEOUT: 180000, 
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
];

class CertificateMigration {
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

  // Get dynamic gas prices from network
  async getDynamicGasPrice() {
    try {
      // Get current network gas prices
      const feeData = await this.provider.getFeeData();
      
      console.log(" Current network gas prices:");
      console.log(`- Gas Price: ${ethers.formatUnits(feeData.gasPrice || "0", "gwei")} gwei`);
      console.log(`- Max Fee: ${ethers.formatUnits(feeData.maxFeePerGas || "0", "gwei")} gwei`);
      console.log(`- Priority Fee: ${ethers.formatUnits(feeData.maxPriorityFeePerGas || "0", "gwei")} gwei`);

      if (feeData.maxFeePerGas && feeData.maxPriorityFeePerGas) {
        // EIP-1559 transaction
        return {
          type: 2,
          maxFeePerGas: feeData.maxFeePerGas * 2n, 
          maxPriorityFeePerGas: feeData.maxPriorityFeePerGas * 2n,
          gasLimit: CONFIG.GAS_LIMIT
        };
      } else {
        // Legacy transaction
        return {
          type: 0,
          gasPrice: feeData.gasPrice ? feeData.gasPrice * 2n : CONFIG.GAS_PRICE,
          gasLimit: CONFIG.GAS_LIMIT
        };
      }
    } catch (error) {
      console.warn("Could not fetch dynamic gas price, using fallback:", error.message);
      
      return {
        type: 2,
        maxFeePerGas: CONFIG.MAX_FEE_PER_GAS,
        maxPriorityFeePerGas: CONFIG.MAX_PRIORITY_FEE_PER_GAS,
        gasLimit: CONFIG.GAS_LIMIT
      };
    }
  }

  // Enhanced transaction 
  async sendTransactionWithRetries(cert, index) {
    for (let attempt = 1; attempt <= CONFIG.MAX_RETRIES; attempt++) {
      try {
        console.log(`Attempt ${attempt}/${CONFIG.MAX_RETRIES} - Issuing certificate ${index + 1} for ${cert.name}...`);

        // Get dynamic gas prices
        const gasConfig = await this.getDynamicGasPrice();
        
        console.log(`Using gas config:`, {
          type: gasConfig.type,
          gasLimit: gasConfig.gasLimit,
          ...(gasConfig.type === 2 ? {
            maxFeePerGas: `${ethers.formatUnits(gasConfig.maxFeePerGas, "gwei")} gwei`,
            maxPriorityFeePerGas: `${ethers.formatUnits(gasConfig.maxPriorityFeePerGas, "gwei")} gwei`
          } : {
            gasPrice: `${ethers.formatUnits(gasConfig.gasPrice, "gwei")} gwei`
          })
        });

        // Send transaction
        const tx = await this.contract.issueCertificate(cert, gasConfig);
        
        console.log(`Transaction sent: ${tx.hash}`);
        console.log(`View on PolygonScan: https://polygonscan.com/tx/${tx.hash}`);
        
        // Wait for confirmation with timeout
        const receipt = await Promise.race([
          tx.wait(),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Transaction timeout')), CONFIG.TIMEOUT)
          )
        ]);

        console.log(`✅ Certificate ${index + 1} issued successfully!`);
        console.log(`Gas used: ${receipt.gasUsed.toString()}`);
        console.log(`Effective gas price: ${ethers.formatUnits(receipt.effectiveGasPrice || "0", "gwei")} gwei`);

        return {
          success: true,
          txHash: tx.hash,
          gasUsed: receipt.gasUsed,
          effectiveGasPrice: receipt.effectiveGasPrice,
          timestamp: new Date().toISOString()
        };

      } catch (error) {
        console.error(`❌ Attempt ${attempt} failed:`, error.message);

        // Check if it's a gas-related error
        if (error.message.includes('insufficient funds')) {
          throw new Error('Insufficient funds for gas fees');
        }

        if (error.message.includes('nonce too low')) {
          console.log("Nonce issue, waiting before retry...");
          await new Promise(resolve => setTimeout(resolve, CONFIG.RETRY_DELAY));
          continue;
        }

        if (error.message.includes('replacement transaction underpriced')) {
          console.log("Transaction underpriced, increasing gas for retry...");
          // Increase gas for next attempt
          CONFIG.MAX_FEE_PER_GAS = (BigInt(CONFIG.MAX_FEE_PER_GAS) * 2n).toString();
          CONFIG.MAX_PRIORITY_FEE_PER_GAS = (BigInt(CONFIG.MAX_PRIORITY_FEE_PER_GAS) * 2n).toString();
          await new Promise(resolve => setTimeout(resolve, CONFIG.RETRY_DELAY));
          continue;
        }

        if (attempt === CONFIG.MAX_RETRIES) {
          throw error; // Final attempt failed
        }

        // Wait before retry
        console.log(`Waiting ${CONFIG.RETRY_DELAY/1000}s before retry...`);
        await new Promise(resolve => setTimeout(resolve, CONFIG.RETRY_DELAY));
      }
    }
  }

  // Read and parse CSV file
  async readCSV() {
    return new Promise((resolve, reject) => {
      const certificates = [];

      fs.createReadStream(CONFIG.CSV_FILE_PATH)
        .pipe(csv({ separator: ';' }))
        .on("data", (row) => {
          const certificate = {
            name: row.name || row.Name || "",
            documentId: row.documentId || row.document_id || row.DocumentId || "",
            course: row.course || row.Course || "",
            description: row.description || row.Description || "",
            institution: row.institution || row.Institution || "",
            area: row.area || row.Area || "",
            issuedDate: row.issuedDate || row.issued_date || row.IssuedDate || "",
            startDate: row.startDate || row.start_date || row.StartDate || "",
            endDate: row.endDate || row.end_date || row.EndDate || "",
            hoursWorked: parseInt(row.hoursWorked || row.hours_worked || row.HoursWorked || "0"),
            signatoryName: row.signatoryName || row.signatory_name || row.SignatoryName || "",
          };

          certificates.push(certificate);
        })
        .on("end", () => {
          console.log(`✅ CSV file read successfully. Found ${certificates.length} certificates.`);
          resolve(certificates);
        })
        .on("error", (error) => {
          console.error("❌ Error reading CSV file:", error);
          reject(error);
        });
    });
  }

  // Validate certificate data
  validateCertificate(cert, index) {
    const required = ["name", "documentId", "course", "institution"];
    const missing = required.filter(field => !cert[field] || cert[field].trim() === "");

    if (missing.length > 0) {
      console.warn(`Certificate ${index + 1} missing required fields: ${missing.join(", ")}`);
      return false;
    }

    return true;
  }

  // Issue a single certificate
  async issueSingleCertificate(cert, index) {
    try {
      const result = await this.sendTransactionWithRetries(cert, index);

      console.log(result);

      this.results.success.push({
        index: index + 1,
        name: cert.name,
        course: cert.course,
        description: cert.description,
        institution: cert.institution,
        area: cert.area,
        startDate: cert.startDate,
        endDate: cert.endDate,
        issuedDate: cert.issuedDate,
        hoursWorked: cert.hoursWorked,
        signatoryName: cert.signatoryName,
        documentId: cert.documentId,
        txHash: result.txHash,
        contractId: 1,
        tokenId: (196 + index).toString(),
        gasUsed: result.gasUsed?.toString(),
        effectiveGasPrice: result.effectiveGasPrice?.toString(),
        timestamp: result.timestamp
      });

      return result;
    } catch (error) {
      console.error(`❌ Final failure for certificate ${index + 1} (${cert.name}):`, error.message);

      this.results.failed.push({
        index: index + 1,
        name: cert.name,
        documentId: cert.documentId,
        error: error.message,
        timestamp: new Date().toISOString()
      });

      return { success: false, error: error.message };
    }
  }

  // Process certificates
  async processCertificates() {
    const validCertificates = this.certificates.filter((cert, index) =>
      this.validateCertificate(cert, index)
    );

    console.log(`\n🚀 Starting migration of ${validCertificates.length} valid certificates...`);
    console.log(`⏱️ Processing sequentially with ${CONFIG.DELAY_BETWEEN_BATCHES/1000}s delays\n`);

    for (let i = 0; i < validCertificates.length; i++) {
      const cert = validCertificates[i];
      
      console.log(`\n Processing certificate ${i + 1}/${validCertificates.length}`);
      console.log(`👤 Name: ${cert.name}`);
      console.log(`📄 Document ID: ${cert.documentId}`);

      await this.issueSingleCertificate(cert, i);

      // Delay between certificates
      if (i < validCertificates.length - 1) {
        console.log(`⏳ Waiting ${CONFIG.DELAY_BETWEEN_BATCHES/1000}s before next certificate...`);
        await new Promise(resolve => setTimeout(resolve, CONFIG.DELAY_BETWEEN_BATCHES));
      }
    }
  }

  // Generate migration report
  generateReport() {
    const escapeLiteral = str => String(str).replace(/'/g, "''");
    const totalGasUsed = this.results.success.reduce((sum, cert) => 
      sum + BigInt(cert.gasUsed || "0"), 0n);
    
    const avgGasUsed = this.results.success.length > 0 ? 
      totalGasUsed / BigInt(this.results.success.length) : 0n;

    const report = `
🎯 POLYGON MAINNET MIGRATION REPORT
=====================================
Total certificates processed: ${this.results.total}
✅ Successfully issued: ${this.results.success.length}
❌ Failed: ${this.results.failed.length}
⛽ Total gas used: ${totalGasUsed.toString()}
📊 Average gas per certificate: ${avgGasUsed.toString()}

SUCCESSFUL CERTIFICATES:
${this.results.success.map(cert =>
  `- ${cert.name} (${cert.documentId})
    TX:  ${cert.txHash}
    Gas: ${cert.gasUsed ?? 'N/A'}
    Timestamp: ${cert.timestamp}`
).join('\n')}

-----------------------------------------------------------------
--  SQL para insertar estos certificados en "certificates_new"
-----------------------------------------------------------------
INSERT INTO certificates_new
  (name, document_id, course, description, institution, area,
   start_date, end_date, issued_date, hours_worked,
   signatory_name, issued_at, token_id, tx_hash, contract_id)
VALUES
${this.results.success.map(cert => `(
  '${escapeLiteral(cert.name)}',
  '${escapeLiteral(cert.documentId)}',
  '${escapeLiteral(cert.course)}',
  '${escapeLiteral(cert.description)}',
  '${escapeLiteral(cert.institution)}',
  '${escapeLiteral(cert.area)}',
  '${escapeLiteral(cert.startDate)}',
  '${escapeLiteral(cert.endDate)}',
  '${escapeLiteral(cert.issuedDate)}',
   ${cert.hoursWorked},                              -- INT
  '${escapeLiteral(cert.signatoryName)}',
  '${cert.timestamp}',                                -- TIMESTAMPTZ (ISO‑8601)
  '${escapeLiteral(cert.tokenId)}',
  '${escapeLiteral(cert.txHash)}',
   ${cert.contractId}                                -- INT (FK)
)`).join(',\n')}
;

${this.results.failed.length > 0 ? `
FAILED CERTIFICATES:
${this.results.failed.map(cert => 
  `- ${cert.name} (${cert.documentId})\n  Error: ${cert.error}\n  Timestamp: ${cert.timestamp}`
).join("\n")}
` : ""}

⚠️ IMPORTANT NOTES:
- All transactions can be viewed on PolygonScan
- Failed transactions may need manual retry with higher gas
- Consider running failed certificates separately
`;

    console.log(report);
    fs.writeFileSync("./polygon-migration-report.txt", report);
    console.log("\n📄 Report saved to migration-report.txt");
  }

  // Main migration function
  async migrate() {
    try {
      console.log("🚀 Starting POLYGON MAINNET certificate migration...\n");

      // Check wallet balance
      const balance = await this.provider.getBalance(this.wallet.address);
      const balanceEth = ethers.formatEther(balance);
      console.log(`💰 Wallet balance: ${balanceEth} MATIC`);

      // Estimate total gas cost
      const estimatedCost = BigInt(CONFIG.GAS_LIMIT) * BigInt(CONFIG.MAX_FEE_PER_GAS);
      const estimatedCostEth = ethers.formatEther(estimatedCost);
      console.log(`⛽ Estimated gas cost per tx: ~${estimatedCostEth} MATIC`);

      if (balance < estimatedCost * 2n) {
        console.warn("⚠️ WARNING: Low balance! You may not have enough MATIC for gas fees.");
        console.log("Consider adding more MATIC to your wallet.");
      }

      // Read CSV
      this.certificates = await this.readCSV();
      this.results.total = this.certificates.length;

      if (this.certificates.length === 0) {
        console.log("❌ No certificates found in CSV file.");
        return;
      }

      console.log(`\n💡 POLYGON MAINNET TIPS:`);
      console.log(`- Gas prices fluctuate frequently`);
      console.log(`- Transactions may take 30-60 seconds`);
      console.log(`- Failed transactions will be retried automatically`);
      console.log(`- Monitor progress on PolygonScan\n`);

      // Process certificates
      await this.processCertificates();

      // Generate report
      this.generateReport();

      console.log("\n🎉 Migration completed!");
      console.log(`✅ Success rate: ${this.results.success.length}/${this.results.total} (${((this.results.success.length/this.results.total)*100).toFixed(1)}%)`);

    } catch (error) {
      console.error("💥 Migration failed:", error);
      this.generateReport(); // Generate report even on failure
    }
  }
}

// Run the migration
export async function RunMigration2() {
  // Validate configuration
  if (!CONFIG.PRIVATE_KEY) {
    console.error("❌ PRIVATE_KEY environment variable not set!");
    console.log('Set it with: export PRIVATE_KEY="your-private-key"');
    process.exit(1);
  }

  if (!fs.existsSync(CONFIG.CSV_FILE_PATH)) {
    console.error(`❌ CSV file not found: ${CONFIG.CSV_FILE_PATH}`);
    process.exit(1);
  }

  console.log("🔧 POLYGON MAINNET CONFIGURATION:");
  console.log(`- RPC URL: ${CONFIG.RPC_URL}`);
  console.log(`- Contract: ${CONFIG.CONTRACT_ADDRESS}`);
  console.log(`- Max Fee per Gas: ${ethers.formatUnits(CONFIG.MAX_FEE_PER_GAS, "gwei")} gwei`);
  console.log(`- Priority Fee: ${ethers.formatUnits(CONFIG.MAX_PRIORITY_FEE_PER_GAS, "gwei")} gwei`);
  console.log(`- Gas Limit: ${CONFIG.GAS_LIMIT}`);
  console.log(`- Delay between certificates: ${CONFIG.DELAY_BETWEEN_BATCHES/1000}s\n`);

  const migration = new CertificateMigration();
  await migration.migrate();
}