import React, { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import SearchIcon from '@mui/icons-material/Search';
import CertificateFound from './CertificateFound';
import CertificateNotFound from './CertificateNotFound';
import StepLoader from './StepLoader';

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
                    <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
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
                            <CertificateNotFound message='No se encontraron certificados'/>
                        )}

                    </div>
                )}
            </div>
        );
    };

    return (
        <div style={{ backgroundColor: '#e3f2fd', height: '100%', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <h2>BUSCAR MIS CERTIFICADOS</h2>
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
                        if (loaderActive){
                            setLoaderActive(false);
                            setLoaderCompleted(false);
                            setShowResults(false);
                        }
                    }}
                    disabled={isSearching}
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
                disabled={isSearching || !documentId}
            >
                {isSearching ? 'Buscando...' : 'Iniciar Búsqueda'}
            </Button>

            {renderContent()}
        </div >
    );
};

export default DocumentIdPage;