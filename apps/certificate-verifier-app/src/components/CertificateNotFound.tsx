import React from 'react';

const NotFound = '/vite.svg'

const CertificateNotFound: React.FC = () => {
  return (
    <div style={{ textAlign: 'center', marginTop: '2rem' }}>
      <h3>Certificado No Encontrado</h3>
      <img 
        src={NotFound} 
        alt="Certificado no encontrado" 
        style={{ width: '300px', maxWidth: '100%', marginTop: '1rem' }} 
      />
    </div>
  );
};

export default CertificateNotFound;
