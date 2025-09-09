import React, { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import { Box } from '@mui/material';
import { Typography } from '@mui/material';
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

const verifyCertificate = async (id: number = 0): Promise<Certificate.InfoType | null> => {
    try {
        const url = new URL(`${url_backend_api}/certificate/id/` + id.toString());

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
        const responseData: { data: Certificate.InfoType } = await response.json();

        // Tu backend devuelve { data: Certificate.InfoType }
        return responseData.data;

    } catch (error) {
        console.error("Error al verificar el certificado:", error);
        return null;
    }
}

const IdVerifierPage: React.FC = () => {
    const { tokenId: routeId } = useParams<{ tokenId?: string }>();
    const [id, setId] = useState<number | ''>('');
    const [certificateFound, setCertificateFound] = useState<boolean>(true);
    const [certificateData, setCertificateData] = useState<Certificate.InfoType | null>(null);
    const [isSearching, setIsSearching] = useState<boolean>(false);
    const [showResults, setShowResults] = useState<boolean>(false);
    const [loaderActive, setLoaderActive] = useState(false);
    const [loaderCompleted, setLoaderCompleted] = useState(false);

    const fetchedOnce = useRef(false);

    useEffect(() => {
        if (routeId && !fetchedOnce.current) {
            const parsedId = parseInt(routeId);
            setId(parsedId);
            handleVerifyCertificate(parsedId);
            fetchedOnce.current = true;
        }
    }, [routeId]);

    const handleAnimationFinished = () => {
        console.log('Animation finished');
        setShowResults(true);
        setIsSearching(false);
    };

    const handleVerifyCertificate = async (idToVerify: number) => {
        setIsSearching(true);
        setShowResults(false);
        setCertificateData(null);
        setLoaderActive(true);
        setLoaderCompleted(false);

        try {
            const result = await verifyCertificate(idToVerify);

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
        // setIsSearching(false);
    };

    const renderContent = () => {
        return (
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    marginTop: '20px',
                    textAlign: 'left'
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
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        {certificateData ? (
                            <CertificateFound {...certificateData} />
                        ) : (
                            <CertificateNotFound message={`El Token ID ${id} no existe`} />
                        )}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div style={{ backgroundColor: 'rgb(248, 250, 252)', height: '100%', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Box
                maxWidth="900px"
                mx="auto"
                mt={2}
                p={3}
                bgcolor="background.paper"
                borderRadius={3}
                boxShadow={3}
                overflow="hidden"
                border={1}
                borderColor="grey.300"
                textAlign= 'center'
            >
                <Typography
                    variant="h4"
                    component="h1"
                    sx={{
                        fontWeight: 700,
                        color: 'rgb(39, 52, 139)',
                        fontSize: { xs: '1.5rem', sm: '1.8rem', md: '2rem' },
                        mb: 1
                    }}
                >
                    Verificar Certificado
                </Typography>
                <Typography
                    variant="body2"
                    sx={{
                        color: 'rgb(100, 116, 139)',
                        fontSize: { xs: '0.875rem', sm: '1rem' },
                        mb: 3
                    }}
                >
                    Ingrese el Token ID (N°)
                </Typography>
                <div style={{ width: '100%', marginBottom: '20px', display: 'flex', justifyContent: 'center' }} >
                    <TextField
                        id="outlined-textarea"
                        label="Token ID:"
                        type="number"
                        value={id ?? ''}
                        onChange={(e) => {
                            const value = e.target.value;
                            setId(value === '' ? 0 : Number(value));
                            if (loaderActive) {
                                setLoaderActive(false);
                                setLoaderCompleted(false);
                                setShowResults(false);
                            }
                        }}
                        disabled={isSearching}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                backgroundColor: 'rgb(248, 250, 252)',
                                borderRadius: '12px',
                                '& fieldset': {
                                    borderColor: 'rgba(39, 52, 139, 0.12)'
                                },
                                '&:hover fieldset': {
                                    borderColor: 'rgb(39, 52, 139)'
                                },
                                '&.Mui-focused fieldset': {
                                    borderColor: 'rgb(39, 52, 139)'
                                },
                                '&.Mui-error fieldset': {
                                    borderColor: 'rgb(211, 47, 47)'
                                }
                            },
                            '& .MuiInputLabel-root': {
                                color: 'rgb(100, 116, 139)',
                                '&.Mui-focused': {
                                    color: 'rgb(39, 52, 139)'
                                },
                                '&.Mui-error': {
                                    color: 'rgb(211, 47, 47)'
                                }
                            },
                            '& .MuiOutlinedInput-input': {
                                color: 'rgb(39, 52, 139)',
                                fontWeight: 500
                            },
                            '& .MuiFormHelperText-root': {
                                color: 'rgb(211, 47, 47)'
                            }
                        }}
                        slotProps={{
                            input: {
                                inputProps: {
                                    inputMode: 'numeric',
                                    pattern: '[0-9]*',
                                },
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
                    />
                </div>
                <Button
                    variant="contained"
                    onClick={() => handleVerifyCertificate(Number(id))}
                    endIcon={<SearchIcon />}
                    disabled={isSearching || !id}
                    sx={{
                        backgroundColor: '#27348b',
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
                        transition: 'all 0.3s ease'
                    }}
                >
                    {(isSearching) ? 'Verificando...' : 'Iniciar Verificación'}
                </Button>

                {renderContent()}
            </Box>
        </div >
    );
};

export default IdVerifierPage;