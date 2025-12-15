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

import { useInstitution } from '../contexts/InstitutionContext';

const url_backend_api = import.meta.env.VITE_API_BACKEND_URL_BASE;

const getHeaders = () => {
    return {
        'Content-Type': 'application/json',
    };
};

const getCertificates = async (documentId: string = ''): Promise<any[][] | null> => {
    try {
        const url = new URL(`${url_backend_api}/certificate/documentId/certificates/` + documentId);
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

        const datos: { data: any[][] } = await response.json();
        return datos.data;
    } catch (error) {
        console.error("Error al verificar el certificado:", error);
        return null;
    }
};


const countCertificates = async (documentId: string = ''): Promise<number> => {
    try {
        const url = new URL(`${url_backend_api}/certificate/documentId/count/` + documentId);

        const response = await fetch(url, {
            method: 'GET',
            headers: getHeaders(),
        });

        if (!response.ok) {
            console.error('Error en la respuesta:', response.status, response.statusText);
            return 0;
        }

        // Verificar que la respuesta sea JSON
        const contentType = response.headers.get('content-type');
        if (!contentType?.includes('application/json')) {
            console.error('La respuesta no es JSON');
            return 0;
        }

        const datos: { data: number } = await response.json();
        return datos.data;

    } catch (error) {
        console.error("Error al contar los certificados:", error);
        return 0;
    }
}

const DocumentIdPage: React.FC = () => {
    const { documentId: routeId } = useParams<{ documentId?: string }>();
    const [documentId, setDocumentId] = useState<string | ''>("");
    const [certificateFound, setCertificateFound] = useState<boolean>(true);
    const [certificateData, setCertificateData] = useState<any[][] | null>(null);
    const [isSearching, setIsSearching] = useState<boolean>(false);
    const [showResults, setShowResults] = useState<boolean>(false);
    const [loaderActive, setLoaderActive] = useState(false);
    const [loaderCompleted, setLoaderCompleted] = useState(false);

    const { config } = useInstitution();

    const fetchedOnce = useRef(false);

    useEffect(() => {
        if (routeId && !fetchedOnce.current) {
            setDocumentId(routeId);
            handleVerifyCertificate(routeId);
            fetchedOnce.current = true;
        }
    }, [routeId]);

    const handleAnimationFinished = () => {
        console.log('Animation finished');
        setShowResults(true);
        setIsSearching(false);
    };

    const handleVerifyCertificate = async (documentIdToVerify: string) => {
        setIsSearching(true);
        setShowResults(false);
        setCertificateData(null);
        setLoaderActive(true);
        setLoaderCompleted(false);

        try {
            const certificatesCount = await countCertificates(documentIdToVerify);

            if (certificatesCount) {
                const certificatesData = await getCertificates(documentIdToVerify);
                setCertificateFound(true);
                setCertificateData(certificatesData);
                //setCertificateData(result);
            } else {
                setCertificateFound(false);
                setCertificateData(null);
            }
        } catch (error) {
            console.error("Error en la verificación:", error);
            setCertificateData(null);
            setCertificateFound(false);
        }
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
                        {certificateData && certificateData.length > 0 ? (
                            certificateData.map((cert, index) => (
                                <CertificateFound
                                    key={index}
                                    tokenId={cert[0]}
                                    name={cert[1]}
                                    documentId={cert[2]}
                                    course={cert[3]}
                                    description={cert[4]}
                                    institution={cert[5]}
                                    area={cert[6]}
                                    issuedDate={cert[7]}
                                    startDate={cert[8]}
                                    endDate={cert[9]}
                                    hoursWorked={cert[10].toString()}
                                    signatoryName={cert[11]}
                                />
                            ))
                        ) : (
                            <CertificateNotFound message='No hay certificados asociados a la cédula ingresada' />
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
                mb={2}
                p={3}
                bgcolor="background.paper"
                borderRadius={3}
                boxShadow={3}
                overflow="hidden"
                border={1}
                borderColor="grey.300"
                textAlign='center'
            >
                <Typography
                    variant="h4"
                    component="h1"
                    sx={{
                        fontWeight: 700,
                        color: config.primaryColor,
                        fontSize: { xs: '1.5rem', sm: '1.8rem', md: '2rem' },
                        mb: 1
                    }}
                >
                    Buscar Certificados
                </Typography>
                <Typography
                    variant="body2"
                    sx={{
                        color: 'rgb(100, 116, 139)',
                        fontSize: { xs: '0.875rem', sm: '1rem' },
                        mb: 3
                    }}
                >
                    Ingrese su número de cédula (10 dígitos)
                </Typography>
                <div style={{
                    width: '100%', marginBottom: '20px', display: 'flex', justifyContent: 'center'
                }} >
                    <TextField
                        id="outlined-textarea"
                        label="Número de cédula:"
                        type="number"
                        value={documentId ?? ''}
                        onChange={(e) => {
                            const value = e.target.value;
                            setDocumentId(value);
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
                </div>
                <Button
                    variant="contained"
                    onClick={() => handleVerifyCertificate(documentId)}
                    endIcon={<SearchIcon />}
                    disabled={isSearching || documentId.length < 10}
                    sx={{
                        backgroundColor: config.primaryColor,
                        color: 'white',
                        fontWeight: 700,
                        fontSize: { xs: '1rem', sm: '1.1rem' },
                        py: { xs: 1.5, sm: 2 },
                        px: { xs: 3, sm: 4 },
                        borderRadius: '12px',
                        boxShadow: `0 4px 16px #27348b 40`,
                        '&:hover': {
                            boxShadow: `0 6px 20px #27348b 50`,
                            transform: 'translateY(-2px)'
                        },
                        transition: 'all 0.3s ease'
                    }}
                >
                    {isSearching ? 'Buscando...' : 'Iniciar Búsqueda'}
                </Button>

                {renderContent()}
            </Box>

        </div >
    );
};

export default DocumentIdPage;