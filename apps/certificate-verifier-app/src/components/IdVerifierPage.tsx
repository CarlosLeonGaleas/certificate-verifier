import React, { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom';
import { TextField, Button, Box, Typography, Container, useTheme, useMediaQuery, Dialog, DialogContent } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CertificateFound from './CertificateFound';
import CertificateNotFound from './CertificateNotFound';
import StepLoader from './StepLoader';
import { Certificate } from "@certificate-verifier/core/src/certificate/data";

import { useInstitution } from '../contexts/InstitutionContext';

const url_backend_api = import.meta.env.VITE_API_BACKEND_URL_BASE;

const getHeaders = () => {
    return {
        'Content-Type': 'application/json',
    };
};

interface VerifyResult {
    success: boolean;
    data: Certificate.InfoType | null;
    errorType?: 'not_found' | 'network';
}

const verifyCertificate = async (id: number = 0): Promise<VerifyResult> => {
    try {
        const url = new URL(`${url_backend_api}/certificate/id/` + id.toString());

        const response = await fetch(url, {
            method: 'GET',
            headers: getHeaders(),
        });

        if (response.status === 404) {
            return { success: false, data: null, errorType: 'not_found' };
        }

        if (!response.ok) {
            console.error('Error en la respuesta:', response.status, response.statusText);
            return { success: false, data: null, errorType: 'network' };
        }

        // Verificar que la respuesta sea JSON
        const contentType = response.headers.get('content-type');
        if (!contentType?.includes('application/json')) {
            console.error('La respuesta no es JSON');
            return { success: false, data: null, errorType: 'network' };
        }

        // Parsear la respuesta
        const responseData: { data: Certificate.InfoType } = await response.json();

        // Tu backend devuelve { data: Certificate.InfoType }
        return { success: true, data: responseData.data };

    } catch (error) {
        console.error("Error al verificar el certificado:", error);
        return { success: false, data: null, errorType: 'network' };
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
    const [errorType, setErrorType] = useState<'not_found' | 'network' | null>(null);

    const { config } = useInstitution();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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
        setLoaderActive(false);
    };

    const handleVerifyCertificate = async (idToVerify: number) => {
        setIsSearching(true);
        setShowResults(false);
        setCertificateData(null);
        setLoaderActive(true);
        setLoaderCompleted(false);
        setErrorType(null);

        try {
            const result = await verifyCertificate(idToVerify);

            if (result.success && result.data) {
                setCertificateFound(true);
                setCertificateData(result.data);
                setErrorType(null);
            } else {
                setCertificateFound(false);
                setCertificateData(null);
                setErrorType(result.errorType || 'not_found');
            }
        } catch (error) {
            console.error("Error en la verificación:", error);
            setCertificateData(null);
            setCertificateFound(false);
            setErrorType('network');
        }

        // señal al loader de que la API terminó
        setLoaderCompleted(true);
        // setIsSearching(false);
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
                            <CertificateNotFound 
                                type={errorType || 'not_found'} 
                                message={errorType === 'network' ? undefined : `El Token ID ${id} no existe`} 
                            />
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
                        Token ID del Certificado
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
                        Ingrese el Token ID (N°) del certificado
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
                            placeholder='0'
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
                    </Box>
                    <Button
                        variant="contained"
                        onClick={() => handleVerifyCertificate(Number(id))}
                        endIcon={<SearchIcon />}
                        disabled={isSearching || !id}
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
                        {(isSearching) ? 'Buscando...' : 'Iniciar Búsqueda'}
                    </Button>

                    {renderContent()}
                </Box>
            </Container>
        </Box >
    );
};

export default IdVerifierPage;