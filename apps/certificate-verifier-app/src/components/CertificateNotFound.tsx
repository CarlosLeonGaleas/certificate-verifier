import React from 'react';

const NotFound = '/NotFound.svg'

interface CertificateNotFoundProps {
  message?: string;
}

const CertificateNotFound: React.FC<CertificateNotFoundProps> = ({ message = 'Certificado No Existe' }) => {
  return (
    <div style={{ textAlign: 'center', marginTop: '2rem' }}>
      <h1>{message}</h1>
      <img 
        src={NotFound} 
        alt="Certificado no existe" 
        style={{ width: '250px', maxWidth: '100%', marginTop: '1rem' }} 
      />
    </div>
  );
};

export default CertificateNotFound;
