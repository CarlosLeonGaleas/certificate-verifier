import React from 'react';

import { Box, Typography } from '@mui/material';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import CloudOffIcon from '@mui/icons-material/CloudOff';

interface CertificateNotFoundProps {
  message?: string;
  type?: 'not_found' | 'network';
}

const CertificateNotFound: React.FC<CertificateNotFoundProps> = ({
  message,
  type = 'not_found'
}) => {
  const isNetwork = type === 'network';

  const headerBg = isNetwork
    ? 'linear-gradient(90deg, #ed6c02, #e65100)'
    : 'linear-gradient(90deg, #b91c1c, #dc2626)';

  const iconColor = isNetwork ? '#ed6c02' : '#b91c1c';

  const title = isNetwork
    ? 'Error de Conexión'
    : 'Certificado No Registrado en la Blockchain';

  const defaultMessage = isNetwork
    ? 'No se pudo establecer conexión con el servidor que interactúa con la Blockchain. Por favor, inténtelo más tarde. Si el problema persiste, póngase en contacto con: investigacion@ister.edu.ec'
    : 'No existe un certificado con los datos proporcionados.';

  const IconComponent = isNetwork ? CloudOffIcon : ReportProblemIcon;

  return (
    <Box
      maxWidth="900px"
      mx="auto"
      mt={5}
      mb={2}
      bgcolor="background.paper"
      borderRadius={3}
      boxShadow={3}
      overflow="hidden"
      border={1}
      borderColor="grey.300"
      width="100%"
    >
      {/* Header */}
      <Box
        sx={{
          px: 6,
          py: 6,
          textAlign: 'center',
          background: headerBg,
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
          <IconComponent sx={{ fontSize: 32, color: iconColor }} />
        </Box>
        <Typography variant="h5" fontWeight="bold">
          {title}
        </Typography>
      </Box>

      {/* Content */}
      <Box p={4} textAlign="center">
        <Typography
          variant="h6"
          color="text.primary"
          fontWeight={500}
          mb={2}
        >
          {message || defaultMessage}
        </Typography>
      </Box>
    </Box>
  );
};

export default CertificateNotFound;
