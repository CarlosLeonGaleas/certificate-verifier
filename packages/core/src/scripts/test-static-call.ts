import { Certificate } from "../certificate";

async function main() {
    console.log("🧪 Running dry-run simulation of certificate issuance...");

    // Test parameters adhering to IssuanceSchema
    const testParams: Certificate.IssuanceType = {
        name: "Test User Galeas",
        documentId: "1726354890",
        course: "Test Course Solidity & TypeScript",
        description: "Test description for blockchain staticCall verification.",
        institution: "Instituto Tecnológico Superior Rumiñahui",
        area: "Investigación",
        issuedDate: "03/07/2026",
        startDate: "10/01/2026",
        endDate: "20/06/2026",
        hoursWorked: 80, // >= 0
        signatoryName: "Ing. Test Signatory",
        localIssued: 0,
        localLimit: 100
    };

    try {
        const issuer = new Certificate.CertificateIssuer();

        // Run dry-run (simulation)
        const isSimulationSuccessful = await issuer.dryRunIssue(testParams);

        if (isSimulationSuccessful) {
            console.log("✅ Simulation successfully passed! The contract call is valid and would succeed under current conditions.");
        } else {
            console.log("❌ Simulation finished without error but returned false.");
        }
    } catch (error) {
        console.error("💥 Simulation failed with error:", (error as Error).message);
        process.exit(1);
    }
}

main();
