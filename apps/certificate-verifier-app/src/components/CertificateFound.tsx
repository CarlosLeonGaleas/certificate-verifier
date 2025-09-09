// Suggested code may be subject to a license. Learn more: ~LicenseLog:3002747772.
import React from 'react';
import { Certificate } from "@certificate-verifier/core"
import IconButton from '@mui/material/IconButton'
import PrintIcon from '@mui/icons-material/Print';
import QRCode from 'qrcode';

//PLANTILLA DE LOS DISTINTOS CERTIFICADOS EMITIDOS (Ubicación de los elementos y estilos)
import html_BACKGROUND001 from '../assets/BACKGROUNDS/BACKGROUND001';
import html_BACKGROUND002 from '../assets/BACKGROUNDS/BACKGROUND002';
import html_BACKGROUND003 from '../assets/BACKGROUNDS/BACKGROUND003';
import html_BACKGROUND004 from '../assets/BACKGROUNDS/BACKGROUND004';
import html_BACKGROUND005 from '../assets/BACKGROUNDS/BACKGROUND005';
import html_BACKGROUND006 from '../assets/BACKGROUNDS/BACKGROUND006';

const getTypeValue = (value: string): string => {
  const parts = value.split('|');
  return parts.length > 1 ? parts[0].trim() : value;
};

const getTitleValue = (value: string): string => {
  const parts = value.split('|');
  return parts.length > 1 ? parts[1].trim() : value;
};

const getBackgroundCode = (value: string): string => {
  const parts = value.split('|');
  return parts.length > 1 ? parts[2].trim() : value;
};

const replacePipeWithComma = (value: string): string => {
  return value.includes('|') ? value.replace(/\|/g, ', ') : value;
};

// Generate QR Code based on url
const getTransactionHashQRCode = async (url: string) => {
  try {
    const transactionHashQRCode = await QRCode.toDataURL(url);
    return transactionHashQRCode.split(',')[1];
  } catch (error) {
    console.error('Error al generar el QR code:', error);
    throw error;
  }
};


const generateCertificateHTML = (certificateData : Certificate.InfoType , transactionHashQRBase64 : string) => {
  try {
    let html_template_BACKGROUND;
    let typeCertificate = getTypeValue(certificateData.course);
    let nameCourse = getTitleValue(certificateData.course);
    let backgroundCode = getBackgroundCode(certificateData.course);
    let doc_id;

    switch (backgroundCode) {
      case 'BACKGROUND001':
        html_template_BACKGROUND = html_BACKGROUND001;
        break;
      case 'BACKGROUND002':
        html_template_BACKGROUND = html_BACKGROUND002;
        break;
      case 'BACKGROUND003':
        html_template_BACKGROUND = html_BACKGROUND003;
        break;
      case 'BACKGROUND004':
        html_template_BACKGROUND = html_BACKGROUND004;
        break;
      case 'BACKGROUND005':
        html_template_BACKGROUND = html_BACKGROUND005;
        break;
      case 'BACKGROUND006':
        html_template_BACKGROUND = html_BACKGROUND006;
        break;
      default:
        // Optional: Handle cases where backgroundCode is not recognized
        html_template_BACKGROUND = html_BACKGROUND003;
        break;
    }
    const urlTokenId = `https://d1uys4mzmfaahs.cloudfront.net/id/${certificateData.tokenId}`;
    const urlHash = `https://d1uys4mzmfaahs.cloudfront.net/hash/${certificateData.hash}`;

    // Reemplazar los placeholders comunes
    html_template_BACKGROUND = html_template_BACKGROUND.replace('{{web-title}}', `${certificateData.tokenId}-${typeCertificate}-${certificateData.name}-${(function (text, maxLength) {
      return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    })(nameCourse, 25)
      }`);
    html_template_BACKGROUND = html_template_BACKGROUND.replace('{{transactionHashQRBase64}}', transactionHashQRBase64);
    html_template_BACKGROUND = html_template_BACKGROUND.replace('{{name}}', certificateData.name);
    html_template_BACKGROUND = html_template_BACKGROUND.replace('{{description}}', certificateData.description);
    html_template_BACKGROUND = html_template_BACKGROUND.replace('{{issuedAt}}', certificateData.issuedDate);
    const paddedTokenID = String(certificateData.tokenId).padStart(4, '0');
    html_template_BACKGROUND = html_template_BACKGROUND.replace('{{tokenID}}', paddedTokenID);
    html_template_BACKGROUND = html_template_BACKGROUND.replace('{{transactionHash}}', certificateData.hash);
    let url_blockchain;
    if (certificateData.hash){
      url_blockchain = `https://polygonscan.com/tx/${certificateData.hash}#eventlog`;
    }
    else{
      url_blockchain = `https://polygonscan.com/nft/0xa447784327062ffaa976142b7636b4346e81965b/${certificateData.tokenId}`;
    }
    html_template_BACKGROUND = html_template_BACKGROUND.replace('{{url-blockchain}}', url_blockchain);
    html_template_BACKGROUND = html_template_BACKGROUND.replace('{{url-hash}}', urlHash);
    html_template_BACKGROUND = html_template_BACKGROUND.replace('{{url-tokenid}}', urlTokenId);


    // Abrir una nueva pestaña con el HTML generado
    const newWindow = window.open();
    newWindow.document.open();
    newWindow.document.write(html_template_BACKGROUND);
    newWindow.document.close();
  } catch (error) {
    console.error('Error al generar el certificado HTML:', error);
  }
};


const openCertificateHTML = async (certificateData: Certificate.InfoType) => {
  try {
    console.log("Certificate Data:", certificateData);
    let url;
    if (certificateData.hash){
      url = `https://d1uys4mzmfaahs.cloudfront.net/hash/${certificateData.hash}`;
    }
    else{
      url = `https://d1uys4mzmfaahs.cloudfront.net/id/${certificateData.tokenId}`;
    }
    const transactionHashQRBase64 = await getTransactionHashQRCode(url);
    generateCertificateHTML(certificateData, transactionHashQRBase64);
  } catch (error) {
    console.error('Error al abrir el certificado HTML:', error);
  }
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
      {tokenId && <p>🆔 <strong>ID del Certificado:</strong> {tokenId}</p>}
      {name && <p>😎 <strong>Beneficiario:</strong> {name}</p>}
      {documentId && <p>🪪 <strong>Cédula del Beneficiario:</strong> {documentId}</p>}
      {course && (
        <p>
          🪧 <strong>Título del Certificado:</strong>{' '}
          {getTitleValue(course)}
        </p>
      )}
      {description && <p>📋 <strong>Descripción:</strong> {description}</p>}
      {institution && <p>🏫 <strong>Institución emisora:</strong> {institution}</p>}
      {area && <p>🏠 <strong>Área emisora:</strong> {area}</p>}
      {issueAt && (
        <p>
          ⛓️ <strong>Registro en la Blockchain:</strong>{' '}
          {issueAt}
        </p>
      )}
      {issuedDate && (
        <p>
          📅 <strong>Lugar y fecha de emisión:</strong>{' '}
          {issuedDate}
        </p>
      )}
      {startDate && <p>📆 <strong>Fecha de Inicio:</strong> {startDate}</p>}
      {endDate && <p>📆 <strong>Fecha de Fin:</strong> {endDate}</p>}
      {hoursWorked != undefined && <p>⏳ <strong>Horas:</strong> {hoursWorked}</p>}
      {hash && <p>🔒 <strong>Hash:</strong> {hash}</p>}
      {signatoryName && (
        <p>
          ✍️ <strong>Firmantes:</strong>{' '}
          {replacePipeWithComma(signatoryName)}
        </p>
      )}
      {getBackgroundCode(course).includes('BACKGROUND') && (
        <p>
          🖨️ <strong>Descargar certificado digital:</strong>{' '}
          <IconButton onClick={() => openCertificateHTML({ tokenId, documentId, name, course, description, institution, area, issueAt, startDate, endDate, issuedDate, hoursWorked, signatoryName, hash })} color="inherit">
          <PrintIcon />
        </IconButton>
        </p>
      )}
    </div>
  );
};

export default CertificateFound;
