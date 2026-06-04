import React, { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom';
import { TextField, Button, Box, Typography, Container, useTheme, useMediaQuery, Dialog, DialogContent } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CertificateFound from './CertificateFound';
import CertificateNotFound from './CertificateNotFound';
import StepLoader from './StepLoader';
import { Certificate } from "@certificate-verifier/core";

import { useInstitution } from '../contexts/InstitutionContext';

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

    const { config } = useInstitution();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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
        setLoaderActive(false);
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
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    mt: { xs: 2, sm: 3, md: 4 }
                }}
            >
                <Dialog
                    open={loaderActive}
                    disableEscapeKeyDown
                    fullWidth
                    maxWidth="sm"
                    slotProps={{
                        paper: {
                            sx: {
                                borderRadius: 3,
                                mx: { xs: 2, sm: 'auto' },
                            }
                        }
                    }}
                >
                    <DialogContent sx={{ p: { xs: 2, sm: 3 } }}>
                        <Box sx={{
                            width: '100%',
                            display: 'flex',
                            justifyContent: 'center',
                        }}>
                            <StepLoader
                                finalSuccess={certificateFound}
                                active={loaderActive}
                                completed={loaderCompleted}
                                onFinish={() => handleAnimationFinished()}
                            />
                        </Box>
                    </DialogContent>
                </Dialog>
                {showResults && (
                    <Box sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        width: '100%'
                    }}>
                        {certificateData ? (
                            <CertificateFound {...certificateData} />
                        ) : (
                            <CertificateNotFound message={`El hash no corresponde a una transacción existente`} />
                        )}
                    </Box>
                )}
            </Box>
        );
    };

    return (
        <Box
            sx={{
                backgroundColor: 'rgb(248, 250, 252)',
                minHeight: '100%',
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
            }}
        >
            <Container maxWidth="lg">
                <Box
                    sx={{
                        mx: 'auto',
                        mt: { xs: 1, sm: 2 },
                        mb: { xs: 2, sm: 2 },
                        p: { xs: 2, sm: 3, md: 3 },
                        bgcolor: 'background.paper',
                        borderRadius: 3,
                        boxShadow: 3,
                        overflow: 'hidden',
                        border: 1,
                        borderColor: 'grey.300',
                        textAlign: 'center'
                    }}
                >
                    <Typography
                        variant={isMobile ? 'h5' : 'h4'}
                        component="h1"
                        sx={{
                            fontWeight: 700,
                            color: config.primaryColor,
                            fontSize: { xs: '1.5rem', sm: '1.8rem', md: '2rem' },
                            mb: { xs: 1, sm: 1 }
                        }}
                    >
                        Hash de la Transacción
                    </Typography>
                    <Typography
                        variant="body2"
                        sx={{
                            color: 'rgb(100, 116, 139)',
                            fontSize: { xs: '0.875rem', sm: '1rem' },
                            mb: { xs: 2, sm: 3 },
                            px: { xs: 1, sm: 0 }
                        }}
                    >
                        Ingrese el hash de la transacción Blockchain
                    </Typography>
                    <Box
                        sx={{
                            width: '100%',
                            mb: { xs: 2, sm: 3 },
                            display: 'flex',
                            justifyContent: 'center'
                        }}
                    >
                        <TextField
                            id="outlined-textarea"
                            placeholder='0x8b607a78e6d...'
                            value={hash ?? ''}
                            onChange={(e) => {
                                const value = e.target.value;
                                setHash(value);
                                if (loaderActive) {
                                    setLoaderActive(false);
                                    setLoaderCompleted(false);
                                    setShowResults(false);
                                }
                            }}
                            multiline
                            disabled={isSearching}
                            fullWidth={isMobile}
                            sx={{
                                maxWidth: { xs: '100%', sm: '500px', md: '600px' },
                                '& .MuiOutlinedInput-root': {
                                    backgroundColor: 'rgb(248, 250, 252)',
                                    borderRadius: '12px',
                                    '& fieldset': {
                                        borderColor: 'rgba(39, 52, 139, 0.12)'
                                    },
                                    '&:hover fieldset': {
                                        borderColor: config.primaryColor
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderColor: config.primaryColor
                                    },
                                    '&.Mui-error fieldset': {
                                        borderColor: 'rgb(211, 47, 47)'
                                    }
                                },
                                '& .MuiInputLabel-root': {
                                    color: 'rgb(100, 116, 139)',
                                    '&.Mui-focused': {
                                        color: config.primaryColor
                                    },
                                    '&.Mui-error': {
                                        color: 'rgb(211, 47, 47)'
                                    }
                                },
                                '& .MuiOutlinedInput-input': {
                                    color: config.primaryColor,
                                    fontWeight: 500
                                },
                                '& .MuiFormHelperText-root': {
                                    color: 'rgb(211, 47, 47)'
                                }
                            }}
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
                        />
                    </Box>
                    <Button
                        variant="contained"
                        onClick={() => handleVerifyCertificate(hash)}
                        endIcon={<SearchIcon />}
                        disabled={isSearching || hash.length < 66}
                        fullWidth={isMobile}
                        sx={{
                            maxWidth: { xs: '100%', sm: 'auto' },
                            backgroundColor: config.primaryColor,
                            color: 'white',
                            fontWeight: 700,
                            fontSize: { xs: '0.875rem', sm: '1rem', md: '1.1rem' },
                            py: { xs: 1.25, sm: 1.5, md: 2 },
                            px: { xs: 3, sm: 3, md: 4 },
                            borderRadius: '12px',
                            boxShadow: `0 4px 16px ${config.primaryColor}40`,
                            '&:hover': {
                                boxShadow: `0 6px 20px ${config.primaryColor}50`,
                                transform: 'translateY(-2px)'
                            },
                            '&:disabled': {
                                backgroundColor: 'rgba(0, 0, 0, 0.12)',
                                color: 'rgba(0, 0, 0, 0.26)'
                            },
                            transition: 'all 0.3s ease'
                        }}
                    >
                        {(isSearching) ? 'Validando...' : 'Iniciar Validación'}
                    </Button>

                    {renderContent()}
                </Box>
            </Container>
        </Box >
    );
};

export default HashVerifierPage;