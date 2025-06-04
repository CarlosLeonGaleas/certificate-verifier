// Suggested code may be subject to a license. Learn more: ~LicenseLog:3002747772.
import React from 'react';
import { Certificate } from "@certificate-verifier/core"

const CertificateFound: React.FC<Certificate.InfoType> = ({
  id,
  documentIdentification,
  name,
  course,
  description,
  institution,
  area,
  issueAt,
  startDate,
  endDate,
  issueDate,
  hoursWorked,
  signatoryName,
  hash,
}) => {
  return (
    <div>
      <h3>Certificado Encontrado en la Blockchain</h3>
      <p>ID: {id}</p>
      <p>Cédula: {documentIdentification}</p>
      <p>Nombre: {name}</p>
      <p>Título del Certificado: {course}</p>
      <p>Descripción: {description}</p>
      <p>Institución: {institution}</p>
      <p>Area: {area}</p>
      <p>Registro en la Blockchain: {issueAt}</p>
      <p>Lugar y fecha de emisión: {issueDate}</p>
      <p>Fecha de Inicio: {startDate}</p>
      <p>Fecha de Fin: {endDate}</p>
      <p>Horas: {hoursWorked}</p>
      <p>Hash: {hash}</p>
      <p>Firmantes: {signatoryName}</p>
    </div>
  );
};

export default CertificateFound;
