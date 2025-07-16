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
        id: z.string(),
        documentIdentification: z.string(),
        name: z.string(),
        course: z.string(),
        description: z.string(),
        institution: z.string(),
        area: z.string(),
        issueAt: z.string(),
        startDate: z.string(),
        endDate: z.string(),
        issueDate: z.string(),
        hoursWorked: z.number(),
        signatoryName: z.string(),
        hash: z.string(),
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
    
}