import React, { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import SearchIcon from '@mui/icons-material/Search';
import CertificateFound from './CertificateFound';
import CertificateNotFound from './CertificateNotFound';
import StepLoader from './StepLoader';
import { Certificate } from "@certificate-verifier/core"

const url_backend_api = import.meta.env.VITE_API_BACKEND_URL_BASE;

const getHeaders = () => {
    return {
        'Content-Type': 'application/json',
    };
};

const verifyCertificate = async (hash: string = ''): Promise<Certificate.InfoType | null> => {
    try {
        const url = new URL(`${url_backend_api}/certificate/hash/` + hash);

        const response = await fetch(url, {
            method: 'GET',
            headers: getHeaders(),
        });

        if (!response.ok) {
            console.error('Error en la respuesta:', response.status, response.statusText);
            return null;
        }

        // Verificar que la respuesta sea JSON
        const contentType = response.headers.get('content-type');
        if (!contentType?.includes('application/json')) {
            console.error('La respuesta no es JSON');
            return null;
        }

        // Parsear la respuesta
        const datos: { data: Certificate.InfoType } = await response.json();
        return datos.data;

    } catch (error) {
        console.error("Error al verificar el certificado:", error);
        return null;
    }
}

const HashVerifierPage: React.FC = () => {
    const { hash: routeId } = useParams<{ hash?: string }>();
    const [hash, setHash] = useState<string | ''>("");
    const [certificateFound, setCertificateFound] = useState<boolean>(true);
    const [certificateData, setCertificateData] = useState<Certificate.InfoType | null>(null);
    const [isSearching, setIsSearching] = useState<boolean>(false);
    const [showResults, setShowResults] = useState<boolean>(false);
    const [loaderActive, setLoaderActive] = useState(false);
    const [loaderCompleted, setLoaderCompleted] = useState(false);

    const fetchedOnce = useRef(false);

    useEffect(() => {
        if (routeId && !fetchedOnce.current) {
            setHash(routeId);
            handleVerifyCertificate(routeId);
            fetchedOnce.current = true;
        }
    }, [routeId]);

    const handleAnimationFinished = () => {
        console.log('Animation finished');
        setShowResults(true);
        setIsSearching(false);
    };

    const handleVerifyCertificate = async (hashToVerify: string) => {
        setIsSearching(true);
        setShowResults(false);
        setCertificateData(null);
        setLoaderActive(true);
        setLoaderCompleted(false);

        try {
            const result = await verifyCertificate(hashToVerify);

            if (result) {
                setCertificateFound(true);
                setCertificateData(result);
            } else {
                setCertificateFound(false);
                setCertificateData(null);
            }
        } catch (error) {
            console.error("Error en la verificación:", error);
            setCertificateData(null);
            setCertificateFound(false);
        }

        // señal al loader de que la API terminó
        setLoaderCompleted(true);
    };


    const renderContent = () => {
        return (
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    marginTop: '20px',
                }}
            >
                {loaderActive && (
                    <StepLoader
                        finalSuccess={certificateFound}
                        active={loaderActive}
                        completed={loaderCompleted}
                        onFinish={() => handleAnimationFinished()} // 👈 Mostrar resultados solo cuando animación termina
                    />
                )}
                {/* Mostrar los resultados debajo del loader si ya completó */}
                {showResults && (
                    <div style={{ marginTop: '50px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        {certificateData ? (
                            <CertificateFound {...certificateData} />
                        ) : (
                            <CertificateNotFound message={`El hash no corresponde a una transacción existente`} />
                        )}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div style={{ backgroundColor: '#e3f2fd', height: '100%', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <h2>VERIFICAR UN CERTIFICADO</h2>
            <div style={{ width: '37%', marginBottom: '20px', display: 'flex', justifyContent: 'center' }} >
                <TextField
                    id="outlined-textarea"
                    label="Hash de la transacción:"
                    value={hash ?? ''}
                    onChange={(e) => {
                        const value = e.target.value;
                        setHash(value);
                        if (loaderActive){
                            setLoaderActive(false);
                            setLoaderCompleted(false);
                            setShowResults(false);
                        }
                    }}
                    multiline
                    fullWidth
                    slotProps={{
                        input: {
                        sx: {
                            backgroundColor: 'white',
                            '& input[type=number]': {
                                MozAppearance: 'textfield',
                            },
                            '& input[type=number]::-webkit-outer-spin-button': {
                                WebkitAppearance: 'none',
                                margin: 0,
                            },
                            '& input[type=number]::-webkit-inner-spin-button': {
                                WebkitAppearance: 'none',
                                margin: 0,
                                },
                            },
                        }
                    }}
                    disabled={isSearching}
                />
            </div>
            <Button
                variant="contained"
                onClick={() => handleVerifyCertificate(hash)}
                endIcon={<SearchIcon />}
                disabled={isSearching || !hash}
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
                {(isSearching) ? 'Verificando...' : 'Iniciar Verificación'}
            </Button>

            {renderContent()}
        </div >
    );
};

export default HashVerifierPage;