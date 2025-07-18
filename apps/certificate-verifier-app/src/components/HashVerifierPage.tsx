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
    const [isSearchingAnimation, setIsSearchingAnimation] = useState<boolean>(false);
    const [showResults, setShowResults] = useState<boolean>(false);
    const [searchCompleted, setSearchCompleted] = useState<boolean>(false);

    const fetchedOnce = useRef(false);

    useEffect(() => {
        if (routeId && !fetchedOnce.current) {
            setHash(routeId);
            handleVerifyCertificate(routeId);
            fetchedOnce.current = true;
        }
    }, [routeId]);

    const handleVerifyCertificate = async (hashToVerify: string) => {
        setIsSearching(true);
        setShowResults(false);
        setSearchCompleted(false);
        setCertificateData(null);

        try {
            const result = await verifyCertificate(hashToVerify); // Ejecuta primero la petición
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
                <div style={{ width: '38%', marginBottom: '20px' }} >
                    <TextField
                        id="outlined-textarea"
                        label="Ingrese el Hash:"
                        placeholder="0x581f94124cd4c8df75ff0dfa80be005x7b129073xd44d7ee3x0x675004f21583"
                        type="number"
                        slotProps={{
                            inputLabel: {
                                shrink: true,
                            },
                        }}
                        value={hash ?? ''}
                        onChange={(e) => {
                            const value = e.target.value;
                            setHash(value);
                        }}
                        multiline
                        fullWidth
                        disabled={isSearching}
                    />
                </div>
            <Button
                variant="contained"
                onClick={() => handleVerifyCertificate(hash)}
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

export default HashVerifierPage;