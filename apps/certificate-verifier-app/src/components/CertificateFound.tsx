// Suggested code may be subject to a license. Learn more: ~LicenseLog:3002747772.
import React from 'react';
import { Certificate } from "@certificate-verifier/core"

const getTitleValue = (value: string): string => {
  const parts = value.split('|');
  return parts.length > 1 ? parts[1].trim() : value;
};

const replacePipeWithComma = (value: string): string => {
  return value.includes('|') ? value.replace(/\|/g, ', ') : value;
};

const CertificateFound: React.FC<Certificate.InfoType> = ({
  tokenId,
  documentId,
  name,
  course,
  description,
  institution,
  area,
  issueAt,
  startDate,
  endDate,
  issuedDate,
  hoursWorked,
  signatoryName,
  hash,
}) => {

  return (
    <div style={{ width: '75%', marginTop: '2rem', backgroundColor: '#fff', padding: '1rem', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}>
      <h2 style={{ textAlign: 'center' }}>Certificado Encontrado en la Blockchain</h2>
      <p>🆔 <strong>ID del Certificado:</strong> {tokenId}</p>
      <p>😎 <strong>Beneficiario:</strong> {name}</p>
      <p>🪪 <strong>Cédula del Beneficiario:</strong> {documentId}</p>
      <p>🪧 <strong>Título del Certificado:</strong> {getTitleValue(course)}</p>
      <p>📋 <strong>Descripción:</strong> {description}</p>
      <p>🏫 <strong>Institución emisora:</strong> {institution}</p>
      <p>🏠 <strong>Área emisora:</strong> {area}</p>
      <p>⛓️ <strong>Registro en la Blockchain:</strong> {issueAt}</p>
      <p>📅 <strong>Lugar y fecha de emisión:</strong> {issuedDate}</p>
      <p>📆 <strong>Fecha de Inicio:</strong> {startDate}</p>
      <p>📆 <strong>Fecha de Fin:</strong> {endDate}</p>
      <p>⏳ <strong>Horas:</strong> {hoursWorked}</p>
      <p>🔒 <strong>Hash:</strong> {hash}</p>
      <p>✍️ <strong>Firmantes:</strong> {replacePipeWithComma(signatoryName)}</p>
    </div>
  );
};

export default CertificateFound;
