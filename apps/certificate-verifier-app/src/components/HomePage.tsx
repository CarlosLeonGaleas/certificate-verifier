import React from 'react'
import RUlogo from '/RU.svg'

const HomePage: React.FC = () => {
    return (
        <div style={{ backgroundColor: '#e3f2fd', height: '100%', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div>
                <img src={RUlogo} className="logo" alt="Rumiñahui logo" />
            </div>
            <h2>VALIDAR CERTIFICADOS EMITIDOS POR EL</h2>
            <h2>INSTITUTO TECNOLÓGICO SUPERIOR UNIVERSITARIO RUMIÑAHUI</h2>
        </div>
    );
};

export default HomePage;
