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
    const [id, setId] = useState<number | ''>(0);
    const [certificateFound, setCertificateFound] = useState<boolean>(true);
    const [certificateData, setCertificateData] = useState<Certificate.InfoType | null>(null);
    const [isSearching, setIsSearching] = useState<boolean>(false);
    const [isSearchingAnimation, setIsSearchingAnimation] = useState<boolean>(false);
    const [showResults, setShowResults] = useState<boolean>(false);
    const [searchCompleted, setSearchCompleted] = useState<boolean>(false);

    const fetchedOnce = useRef(false);

    useEffect(() => {
        if (routeId && !fetchedOnce.current) {
            const parsedId = parseInt(routeId);
            setId(parsedId);
            handleVerifyCertificate(parsedId);
            fetchedOnce.current = true;
        }
    }, [routeId]);

    const handleVerifyCertificate = async (idToVerify: number) => {
        setIsSearching(true);
        setShowResults(false);
        setSearchCompleted(false);
        setCertificateData(null);

        try {
            const result = await verifyCertificate(idToVerify); // Ejecuta primero la petición
            setIsSearchingAnimation(true); // Comienza animación cuando hay respuesta

            if (result) {
                setCertificateFound(true);
                setCertificateData(result);
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
                            {certificateData ? (
                                <CertificateFound {...certificateData} />
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
                <h2>VERIFIQUE INFORMACIÓN DEL CERTIFICADO</h2>
                <div style={{ width: '20%', marginBottom: '20px' }} >
                    <TextField
                        id="outlined-textarea"
                        label="Ingrese el Token ID:"
                        placeholder="0"
                        type="number"
                        slotProps={{
                            inputLabel: {
                                shrink: true,
                            },
                        }}
                        value={id ?? ''}
                        onChange={(e) => {
                            const value = e.target.value;
                            setId(value === '' ? 0 : Number(value));
                        }}
                        multiline
                        fullWidth
                        disabled={isSearching}
                    />
                </div>
            <Button
                variant="contained"
                onClick={() => handleVerifyCertificate(Number(id))}
                endIcon={<SearchIcon />}
                disabled={isSearching}
            >
                {isSearching ? 'Buscando...' : 'Buscar Certificado'}
            </Button>

            {renderContent()}
        </div>
        </div >
    );
};

export default IdVerifierPage;