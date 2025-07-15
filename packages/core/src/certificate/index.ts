import { z } from "zod";
import { Examples } from "../examples";

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
    
}