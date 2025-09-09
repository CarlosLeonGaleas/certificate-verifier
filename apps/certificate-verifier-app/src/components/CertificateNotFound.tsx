import React from 'react';

import { Box, Typography } from '@mui/material';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';

interface CertificateNotFoundProps {
  message?: string;
}

const CertificateNotFound: React.FC<CertificateNotFoundProps> = ({ message = 'Certificado No Existe' }) => {
  return (
    <Box
      maxWidth="900px"
      mx="auto"
      mb={5}
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
          background: 'linear-gradient(90deg, #b91c1c, #dc2626)', // degradado rojo
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
          <ReportProblemIcon sx={{ fontSize: 32, color: '#b91c1c'}} />
        </Box>
        <Typography variant="h5" fontWeight="bold">
          Certificado No Registrado en la Blockchain
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
          {message || 'No existe un certificado con los datos proporcionados.'}
        </Typography>
        </Box>
    </Box>
  );
};

export default CertificateNotFound;
