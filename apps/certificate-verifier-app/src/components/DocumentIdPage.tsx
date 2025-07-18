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
    const [isSearchingAnimation, setIsSearchingAnimation] = useState<boolean>(false);
    const [showResults, setShowResults] = useState<boolean>(false);
    const [searchCompleted, setSearchCompleted] = useState<boolean>(false);

    const fetchedOnce = useRef(false);

    useEffect(() => {
        if (routeId && !fetchedOnce.current) {
            setDocumentId(routeId);
            handleVerifyCertificate(routeId);
            fetchedOnce.current = true;
        }
    }, [routeId]);

    const handleVerifyCertificate = async (documentIdToVerify: string) => {
        setIsSearching(true);
        setShowResults(false);
        setSearchCompleted(false);
        setCertificateData(null);

        try {
            const certificatesCount = await countCertificates(documentIdToVerify); // Ejecuta primero la petición
            setIsSearchingAnimation(true); // Comienza animación cuando hay respuesta

            if (certificatesCount) {
                setCertificateFound(true);
                const certificatesData = await getCertificates(documentIdToVerify); // Ejecuta primero la petición
                setCertificateData(certificatesData);
                //setCertificateData(result);
            } else {
                setCertificateFound(false);
                setCertificateData(null);
            }

            // Esperar 8 segundos después de recibir la respuesta
            await new Promise(resolve => setTimeout(resolve, 6500));


        } catch (error) {
            console.error("Error en la verificación:", error);
            setCertificateData(null);
            setCertificateFound(false);
        }

        setIsSearching(false);
        setIsSearchingAnimation(false);
        setSearchCompleted(true);
        setShowResults(true);
    };


    const renderContent = () => {
        // Si está buscando o ya completó la búsqueda, mostrar el StepLoader
        if (isSearchingAnimation || searchCompleted) {
            return (
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        marginTop: '20px',
                    }}
                >
                    <StepLoader finalSuccess={certificateFound} />
                    {/* Mostrar los resultados debajo del loader si ya completó */}
                    {searchCompleted && showResults && (
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
                                <CertificateNotFound />
                            )}

                        </div>
                    )}
                </div>
            );
        } else {
            return null;
        }
    };

    return (
        <div style={{ backgroundColor: '#e3f2fd', height: '100%', width: '100%' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: 'auto', padding: '20px' }}>
                <h2>BUSCAR MIS CERTIFICADOS</h2>
                <div style={{ width: '20%', marginBottom: '20px' }} >
                    <TextField
                        id="outlined-textarea"
                        label="Ingrese su número de cédula:"
                        placeholder="1010101010"
                        type="number"
                        slotProps={{
                            inputLabel: {
                                shrink: true,
                            },
                        }}
                        value={documentId ?? ''}
                        onChange={(e) => {
                            const value = e.target.value;
                            setDocumentId(value);
                        }}
                        disabled={isSearching}
                    />
                </div>
                <Button
                    variant="contained"
                    onClick={() => handleVerifyCertificate(documentId)}
                    endIcon={<SearchIcon />}
                    disabled={isSearching}
                >
                    {isSearching ? 'Buscando...' : 'Iniciar Búsqueda'}
                </Button>

                {renderContent()}
            </div>
        </div >
    );
};

export default DocumentIdPage;