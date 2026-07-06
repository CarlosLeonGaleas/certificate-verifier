import { z } from "zod";

export namespace Certificate {
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
    });

    export type InfoType = z.infer<typeof InfoSchema>;

    export interface BasicCertificateInfo {
        tokenId: string;
        name: string;
        documentId: string;
        course: string;
        institution: string;
    }

    export interface CertificateMetadata {
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

    export interface TransactionInfo {
        hash: string;
        blockNumber: number;
        gasUsed: string;
    }

    export const IssuanceSchema = z.object({
        name: z.string(),
        documentId: z.string(),
        course: z.string(),
        description: z.string(),
        institution: z.string(),
        area: z.string(),
        issuedDate: z.string(),
        startDate: z.string(),
        endDate: z.string(),
        hoursWorked: z.number().int().nonnegative(),
        signatoryName: z.string(),
        localIssued: z.number().int().nonnegative(),
        localLimit: z.number().int().nonnegative()
    });

    export type IssuanceType = z.infer<typeof IssuanceSchema>;
}