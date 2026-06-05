import React from 'react';
import { Certificate } from "@certificate-verifier/core/src/certificate/data";
import QRCode from 'qrcode';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Button,
  Avatar,
  Divider,
  useTheme,
  useMediaQuery,
  Container,
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
import html_BACKGROUND003 from '../assets/BACKGROUNDS/BACKGROUND003';
import html_BACKGROUND005 from '../assets/BACKGROUNDS/BACKGROUND005';
import html_BACKGROUND006 from '../assets/BACKGROUNDS/BACKGROUND006';
import html_BACKGROUND008 from '../assets/BACKGROUNDS/BACKGROUND008';
import html_BACKGROUND009 from '../assets/BACKGROUNDS/BACKGROUND009';
import html_BACKGROUND010 from '../assets/BACKGROUNDS/BACKGROUND010';

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

    const urlTokenId = `https://d1uys4mzmfaahs.cloudfront.net/id/${certificateData.tokenId}`;
    let urlHash = `https://d1uys4mzmfaahs.cloudfront.net/hash/${certificateData.hash}`;

    switch (backgroundCode) {
      case 'BACKGROUND001':
        html_template_BACKGROUND = html_BACKGROUND001;
        break;
      case 'BACKGROUND002':
        html_template_BACKGROUND = html_BACKGROUND001;
        html_template_BACKGROUND = html_template_BACKGROUND.replace('{{BACKGROUND}}', 'BACKGROUND002');
        break;
      case 'BACKGROUND003':
        html_template_BACKGROUND = html_BACKGROUND003;
        break;
      case 'BACKGROUND004':
        html_template_BACKGROUND = html_BACKGROUND003;
        break;
      case 'BACKGROUND005':
        html_template_BACKGROUND = html_BACKGROUND005;
        break;
      case 'BACKGROUND006':
        if (typeCertificate === "PROYECTO") {
          html_template_BACKGROUND = html_BACKGROUND005;
        } else {
          html_template_BACKGROUND = html_BACKGROUND006;
        }
        break;
      case 'BACKGROUND007':
        html_template_BACKGROUND = html_BACKGROUND005;
        html_template_BACKGROUND = html_template_BACKGROUND.replace('{{BACKGROUND}}', 'BACKGROUND007');
        break;
      case 'BACKGROUND008':
        html_template_BACKGROUND = html_BACKGROUND008;
        urlHash = `https://d1uys4mzmfaahs.cloudfront.net/ITCA/hash/${certificateData.hash}`;
        let variant8;
        if (nameCourse.includes(':')) {
          [variant8] = nameCourse.split(':').map(s => s.trim());
        } else {
          variant8 = 'PONENTE';
        }
        html_template_BACKGROUND = html_template_BACKGROUND.replace('{{variant}}', variant8.toUpperCase());
        html_template_BACKGROUND = html_template_BACKGROUND.replace('{{documentID}}', certificateData.documentId);
        break;
      case 'BACKGROUND009':
        html_template_BACKGROUND = html_BACKGROUND009;
        urlHash = `https://d1uys4mzmfaahs.cloudfront.net/ITCA/hash/${certificateData.hash}`;
        let variant9;
        if (nameCourse.includes(':')) {
          [variant9] = nameCourse.split(':').map(s => s.trim());
        } else {
          variant9 = 'ASISTENTE';
        }
        html_template_BACKGROUND = html_template_BACKGROUND.replace('{{variant}}', variant9.toUpperCase());
        html_template_BACKGROUND = html_template_BACKGROUND.replace('{{documentID}}', certificateData.documentId);
        break;
      case 'BACKGROUND010':
        html_template_BACKGROUND = html_BACKGROUND010;
        break;
      default:
        html_template_BACKGROUND = html_BACKGROUND005;
        break;
    }

    html_template_BACKGROUND = html_template_BACKGROUND.replace('{{web-title}}', `${certificateData.tokenId}-${typeCertificate}-${certificateData.name}-${(function (text, maxLength) {
      return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    })(nameCourse, 25)}`);
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
      html_template_BACKGROUND = html_template_BACKGROUND.replace('{{transactionHash}}', certificateData.hash);
      html_template_BACKGROUND = html_template_BACKGROUND.replace('{{url-hash}}', urlHash);
    } else {
      url_blockchain = `https://polygonscan.com/nft/0xa447784327062ffaa976142b7636b4346e81965b/${certificateData.tokenId}`;
      html_template_BACKGROUND = html_template_BACKGROUND.replace('{{transactionHash}}', '');
      html_template_BACKGROUND = html_template_BACKGROUND.replace('{{url-hash}}', '');
    }
    html_template_BACKGROUND = html_template_BACKGROUND.replace('{{url-blockchain}}', url_blockchain);
    html_template_BACKGROUND = html_template_BACKGROUND.replace('{{url-tokenid}}', urlTokenId);

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
    if (certificateData.institution.includes('ITCA')) {
      if (certificateData.hash) {
        url = `https://d1uys4mzmfaahs.cloudfront.net/ITCA/hash/${certificateData.hash}`;
      } else {
        url = `https://d1uys4mzmfaahs.cloudfront.net/ITCA/id/${certificateData.tokenId}`;
      }
    } else {
      if (certificateData.hash) {
        url = `https://d1uys4mzmfaahs.cloudfront.net/hash/${certificateData.hash}`;
      } else {
        url = `https://d1uys4mzmfaahs.cloudfront.net/id/${certificateData.tokenId}`;
      }
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  const InfoItem = ({ icon: Icon, label, value }) => {
    if (!value && value !== 0) return null;

    return (
      <Paper
        elevation={1}
        sx={{
          p: { xs: 1.5, sm: 2 },
          display: 'flex',
          alignItems: 'flex-start',
          gap: { xs: 1, sm: 2 },
          borderRadius: 2,
          transition: 'background-color 0.2s',
          '&:hover': { bgcolor: 'grey.100' },
        }}
      >
        <Avatar
          sx={{
            bgcolor: config.primaryColor,
            width: { xs: 32, sm: 40 },
            height: { xs: 32, sm: 40 }
          }}
        >
          <Icon sx={{ color: 'white', fontSize: { xs: 16, sm: 20 } }} />
        </Avatar>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            variant="caption"
            color="text.secondary"
            gutterBottom
            sx={{
              fontSize: { xs: '0.7rem', sm: '0.75rem' }, textAlign: 'justify',
              display: 'block'
            }}
          >
            <strong>{label}</strong>
          </Typography>
          <Typography
            variant="body1"
            sx={{
              wordBreak: 'break-word',
              fontWeight: 500,
              textAlign: 'justify',
              fontSize: { xs: '0.875rem', sm: '1rem' }
            }}
          >
            {value}
          </Typography>
        </Box>
      </Paper>
    );
  };

  return (
    <Container maxWidth="lg" sx={{ px: { xs: 0, sm: 2 } }}>
      <Box
        sx={{
          mx: 'auto',
          mt: { xs: 4, sm: 6, md: 8 },
          bgcolor: 'background.paper',
          borderRadius: { xs: 2, sm: 3 },
          boxShadow: 3,
          overflow: 'hidden',
          border: 1,
          borderColor: 'grey.300',
        }}
      >
        {/* Header */}
        <Box
          sx={{
            px: { xs: 3, sm: 4, md: 6 },
            py: { xs: 3, sm: 4, md: 6 },
            textAlign: 'center',
            background: config.certificateFoundColor,
            color: 'white',
          }}
        >
          <Box
            sx={{
              width: { xs: 48, sm: 56, md: 64 },
              height: { xs: 48, sm: 56, md: 64 },
              mx: 'auto',
              mb: { xs: 1.5, sm: 2 },
              bgcolor: 'white',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <MilitaryTech
              sx={{
                fontSize: { xs: 24, sm: 28, md: 32 },
                color: config.primaryColor
              }}
            />
          </Box>
          <Typography
            variant={isMobile ? 'h6' : 'h5'}
            fontWeight="bold"
            mb={1}
            sx={{ fontSize: { xs: '1.125rem', sm: '1.25rem', md: '1.5rem' } }}
          >
            Certificado Encontrado en la Blockchain
          </Typography>
        </Box>

        {/* Content */}
        <Box p={{ xs: 2, sm: 3, md: 4 }}>
          {/* Información Principal */}
          <Box mb={{ xs: 2, sm: 3 }}>
            <Typography
              variant="h6"
              fontWeight={600}
              mb={{ xs: 2, sm: 3 }}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                fontSize: { xs: '1rem', sm: '1.125rem', md: '1.25rem' }
              }}
            >
              <Person sx={{ fontSize: { xs: 20, sm: 24 } }} />
              Información del Certificado
            </Typography>
            <Grid container spacing={{ xs: 2, sm: 3 }}>
              <Grid item xs={12} md={6}>
                <InfoItem icon={Person} label="Beneficiario" value={name} />
              </Grid>
              <Grid item xs={12} md={6}>
                <InfoItem icon={Cedula} label="Cédula del Beneficiario" value={documentId} />
              </Grid>
            </Grid>
          </Box>

          {/* Descripción */}
          <Box mb={{ xs: 2, sm: 3 }}>
            <InfoItem icon={EmojiEvents} label="Título del Certificado" value={getTitleValue(course)} />
          </Box>
          <Box mb={{ xs: 3, sm: 4, md: 5 }}>
            <InfoItem icon={Description} label="Descripción" value={description} />
          </Box>

          {/* Información Institucional */}
          <Box mb={{ xs: 3, sm: 4, md: 5 }}>
            <Typography
              variant="h6"
              fontWeight={600}
              mb={{ xs: 2, sm: 3 }}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                fontSize: { xs: '1rem', sm: '1.125rem', md: '1.25rem' }
              }}
            >
              <Apartment sx={{ fontSize: { xs: 20, sm: 24 } }} />
              Información Institucional
            </Typography>
            <Grid container spacing={{ xs: 2, sm: 3 }}>
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
          <Box mb={{ xs: 3, sm: 4, md: 5 }}>
            <Typography
              variant="h6"
              fontWeight={600}
              mb={{ xs: 2, sm: 3 }}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                fontSize: { xs: '1rem', sm: '1.125rem', md: '1.25rem' }
              }}
            >
              <CalendarToday sx={{ fontSize: { xs: 20, sm: 24 } }} />
              Fechas y Duración
            </Typography>
            <Grid container spacing={{ xs: 2, sm: 3 }}>
              <Grid item xs={12} sm={6} md={4}>
                <InfoItem icon={CalendarToday} label="Fecha de Emisión" value={issuedDate} />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <InfoItem icon={CalendarToday} label="Fecha de Inicio" value={startDate} />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <InfoItem icon={CalendarToday} label="Fecha de Fin" value={endDate} />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <InfoItem icon={AccessTime} label="Duración" value={hoursWorked} />
              </Grid>
            </Grid>
          </Box>

          {/* Información Técnica */}
          <Box mb={{ xs: 3, sm: 4, md: 5 }}>
            <Typography
              variant="h6"
              fontWeight={600}
              mb={{ xs: 2, sm: 3 }}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                fontSize: { xs: '1rem', sm: '1.125rem', md: '1.25rem' }
              }}
            >
              <Blockchain sx={{ fontSize: { xs: 20, sm: 24 } }} />
              Información Técnica (Blockchain)
            </Typography>
            <Box mb={{ xs: 2, sm: 3 }}>
              <InfoItem icon={Id} label="Token ID" value={tokenId} />
            </Box>
            <Box mb={{ xs: 2, sm: 3 }}>
              <InfoItem icon={Hash} label="Hash de la Transacción" value={hash} />
            </Box>
            <Box mb={{ xs: 2, sm: 3 }}>
              <InfoItem icon={CalendarToday} label="Fecha y Hora de Registro en la Blockchain" value={issueAt} />
            </Box>
          </Box>

          {/* Botón de Descarga */}
          {getBackgroundCode(course).includes('BACKGROUND') && hash && (
            <>
              <Divider sx={{ mb: { xs: 2, sm: 3 } }} />
              <Box display="flex" justifyContent="center">
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={!isMobile && <Download />}
                  fullWidth={isMobile}
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
                  sx={{
                    maxWidth: { xs: '100%', sm: 'auto' },
                    backgroundColor: '#27348b',
                    color: 'white',
                    fontWeight: 700,
                    fontSize: { xs: '0.875rem', sm: '1rem', md: '1.1rem' },
                    py: { xs: 1.25, sm: 1.5, md: 2 },
                    px: { xs: 3, sm: 3, md: 4 },
                    borderRadius: '12px',
                    boxShadow: `0 4px 16px #27348b40`,
                    '&:hover': {
                      backgroundColor: 'rgb(63, 81, 181)',
                      boxShadow: `0 6px 20px #27348b50`,
                      transform: 'translateY(-2px)'
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  {isMobile ? 'Descargar' : 'Descargar Certificado Digital'}
                </Button>
              </Box>
            </>
          )}
        </Box>
      </Box>
    </Container>
  );
};

export default CertificateFound;