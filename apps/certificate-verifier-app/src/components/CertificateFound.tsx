// Suggested code may be subject to a license. Learn more: ~LicenseLog:3002747772.
import React from 'react';
import { Certificate } from "@certificate-verifier/core"
import QRCode from 'qrcode';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Button,
  Avatar,
  Divider,
} from '@mui/material';
import {
  CalendarToday,
  AccessTime,
  EmojiEvents,
  Person,
  Apartment,
  Description,
  Verified,
  Groups,
  Download,
  Tag as Hash,
  MilitaryTech,
  Pin as Id,
  Link as Blockchain,
  Badge as Cedula
} from '@mui/icons-material';

import { useInstitution } from '../contexts/InstitutionContext';

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


const generateCertificateHTML = (certificateData: Certificate.InfoType, transactionHashQRBase64: string) => {
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
        html_template_BACKGROUND = html_BACKGROUND005;
        break;
      case 'BACKGROUND007':
        html_template_BACKGROUND = html_BACKGROUND005;
        html_template_BACKGROUND = html_template_BACKGROUND.replace('{{BACKGROUND}}', 'BACKGROUND007');
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
    html_template_BACKGROUND = html_template_BACKGROUND.replace('{{cedula}}', certificateData.documentId);
    html_template_BACKGROUND = html_template_BACKGROUND.replace('{{description}}', certificateData.description);
    html_template_BACKGROUND = html_template_BACKGROUND.replace('{{issuedAt}}', certificateData.issuedDate);
    const paddedTokenID = String(certificateData.tokenId).padStart(4, '0');
    html_template_BACKGROUND = html_template_BACKGROUND.replace('{{tokenID}}', paddedTokenID);
    let url_blockchain;
    if (certificateData.hash) {
      url_blockchain = `https://polygonscan.com/tx/${certificateData.hash}#eventlog`;
      html_template_BACKGROUND = html_template_BACKGROUND.replace('{{transactionHash}}', 'Hash: ' + certificateData.hash);
      html_template_BACKGROUND = html_template_BACKGROUND.replace('{{url-hash}}', urlHash);
    }
    else {
      url_blockchain = `https://polygonscan.com/nft/0xa447784327062ffaa976142b7636b4346e81965b/${certificateData.tokenId}`;
      html_template_BACKGROUND = html_template_BACKGROUND.replace('{{transactionHash}}', '');
      html_template_BACKGROUND = html_template_BACKGROUND.replace('{{url-hash}}', '');
    }
    html_template_BACKGROUND = html_template_BACKGROUND.replace('{{url-blockchain}}', url_blockchain);
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
    if (certificateData.hash) {
      url = `https://d1uys4mzmfaahs.cloudfront.net/hash/${certificateData.hash}`;
    }
    else {
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
  const { config } = useInstitution();
  const InfoItem = ({ icon: Icon, label, value }) => {
    if (!value && value !== 0) return null;

    return (
      <Paper
        elevation={1}
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'flex-start',
          gap: 2,
          borderRadius: 2,
          transition: 'background-color 0.2s',
          '&:hover': { bgcolor: 'grey.100' },
        }}
      >
        <Avatar sx={{ bgcolor: config.primaryColor, width: 40, height: 40 }}>
          <Icon sx={{ color: 'white', fontSize: 20 }} />
        </Avatar>
        <Box>
          <Typography variant="caption" color="text.secondary" gutterBottom>
            <strong>{label}</strong>
          </Typography>
          <Typography variant="body1" sx={{ wordBreak: 'break-word', fontWeight: 500 }}>
            {value}
          </Typography>
        </Box>
      </Paper>
    );
  };

  return (
    <Box
      maxWidth="900px"
      mx="auto"
      mt={8}
      bgcolor="background.paper"
      borderRadius={3}
      boxShadow={3}
      overflow="hidden"
      border={1}
      borderColor="grey.300"
    >
      {/* Header */}
      <Box
        sx={{
          px: 6,
          py: 6,
          textAlign: 'center',
          background: config.certificateFoundColor,
          color: 'white',
        }}
      >
        <Box
          sx={{
            width: 64,
            height: 64,
            mx: 'auto',
            mb: 2,
            bgcolor: 'white',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <MilitaryTech sx={{ fontSize: 32, color: config.primaryColor }} />
        </Box>
        <Typography variant="h5" fontWeight="bold" mb={1}>
          Certificado Encontrado en la Blockchain
        </Typography>
        {/* <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1 }}>
          <Verified sx={{ color: 'lightgreen' }} />
          <Typography color="grey.100">Existencia Confirmada</Typography>
        </Box> */}
      </Box>

      {/* Content */}
      <Box p={4}>
        {/* Información Principal */}
        <Box mb={3}>
          <Typography variant="h6" fontWeight={600} mb={3} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Person /> Información del Certificado
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <InfoItem icon={Person} label="Beneficiario" value={name} />
            </Grid>
            <Grid item xs={12} md={6}>
              <InfoItem icon={Cedula} label="Cédula del Beneficiario" value={documentId} />
            </Grid>
          </Grid>
        </Box>

        {/* Descripción */}
        <Box mb={3}>
          <InfoItem icon={EmojiEvents} label="Título del Certificado" value={getTitleValue(course)} />
        </Box>
        <Box mb={5}>
          <InfoItem icon={Description} label="Descripción" value={description} />
        </Box>

        {/* Información Institucional */}
        <Box mb={5}>
          <Typography variant="h6" fontWeight={600} mb={3} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Apartment /> Información Institucional
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <InfoItem icon={Apartment} label="Institución Emisora" value={institution} />
            </Grid>
            <Grid item xs={12} md={6}>
              <InfoItem icon={Apartment} label="Área Emisora" value={area} />
            </Grid>
            <Grid item xs={12}>
              <InfoItem icon={Groups} label="Firmantes" value={replacePipeWithComma(signatoryName)} />
            </Grid>
          </Grid>
        </Box>

        {/* Fechas y Duración */}
        <Box mb={5}>
          <Typography variant="h6" fontWeight={600} mb={3} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CalendarToday /> Fechas y Duración
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <InfoItem icon={CalendarToday} label="Fecha de Emisión" value={issuedDate} />
            </Grid>
            <Grid item xs={12} md={4}>
              <InfoItem icon={CalendarToday} label="Fecha de Inicio" value={startDate} />
            </Grid>
            <Grid item xs={12} md={4}>
              <InfoItem icon={CalendarToday} label="Fecha de Fin" value={endDate} />
            </Grid>
            <Grid item xs={12} md={4}>
              <InfoItem icon={AccessTime} label="Duración" value={hoursWorked} />
            </Grid>
          </Grid>
        </Box>

        {/* Información Técnica */}
        <Box mb={5}>
          <Typography variant="h6" fontWeight={600} mb={3} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Blockchain /> Información Técnica (Blockchain)
          </Typography>
          <Box mb={3}>
            <InfoItem icon={Id} label="Token ID" value={tokenId} />
          </Box>
          <Box mb={3}>
            <InfoItem icon={Hash} label="Hash de la Transacción" value={hash} />
          </Box>
          <Box mb={3}>
            <InfoItem icon={CalendarToday} label="Fecha y Hora de Registro en la Blockchain" value={issueAt} />
          </Box>
        </Box>

        {/* Botón de Descarga */}
        {getBackgroundCode(course).includes('BACKGROUND') && hash && (
          <>
            <Divider sx={{ mb: 3 }} />
            <Box display="flex" justifyContent="center">
              <Button
                variant="contained"
                color="primary"
                startIcon={<Download />}
                onClick={() =>
                  openCertificateHTML({
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
                  })
                }
                sx={{ backgroundColor: '#27348b',
                  color: 'white',
                  fontWeight: 700,
                  fontSize: { xs: '1rem', sm: '1.1rem' },
                  py: { xs: 1.5, sm: 2 },
                  px: { xs: 3, sm: 4 },
                  borderRadius: '12px',
                  boxShadow: `0 4px 16px #27348b 40`,
                  '&:hover': {
                    backgroundColor: 'rgb(63, 81, 181)',
                    boxShadow: `0 6px 20px #27348b 50`,
                    transform: 'translateY(-2px)'
                  },
                  transition: 'all 0.3s ease'}}
              >
                Descargar Certificado Digital
              </Button>
            </Box>
          </>
        )}
      </Box>
    </Box>
  );
};

export default CertificateFound;
