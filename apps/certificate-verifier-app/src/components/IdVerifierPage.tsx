import React, { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import SearchIcon from '@mui/icons-material/Search';
import CertificateFound from './CertificateFound';
import CertificateNotFound from './CertificateNotFound';
import { Certificate } from "@certificate-verifier/core"

const url_backend_api = import.meta.env.VITE_API_BACKEND_URL_BASE;
const BEARER_TOKEN = import.meta.env.VITE_BEARER_TOKEN;

const getHeaders = () => {
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${BEARER_TOKEN}`,
    };
};


const verifyCertificate = async (id: number = 0): Promise<Certificate.InfoType | null> => {
    try {
        const url = new URL(`${url_backend_api}/certificate/id/` + id.toString());

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



const HomePage: React.FC = () => {
    const { id: routeId } = useParams<{ id?: string }>();
    const [id, setId] = useState<number | undefined>(0);
    const [certificateFound, setCertificateFound] = useState<boolean>(true);
    const [certificateData, setCertificateData] = useState<Certificate.InfoType | null>(null);

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
        const result = await verifyCertificate(idToVerify);
        if (result) {
            setCertificateData(result);
            setCertificateFound(true);
        } else {
            setCertificateData(null);
            setCertificateFound(false);
        }
    };

    return (
        <div style={{ backgroundColor: '#e3f2fd', height: '100%', width: '100%' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: 'auto', padding: '20px' }}>
                <h2>VERIFIQUE INFORMACIÓN DEL CERTIFICADO</h2>
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
                />
                <Button variant="contained" onClick={() => handleVerifyCertificate(id)} endIcon={<SearchIcon />}>
                    Buscar Certificado
                </Button>
                {certificateData ? (
                    <CertificateFound {...certificateData} />
                ) : certificateFound ? (
                    <div />
                ) : (
                    <CertificateNotFound />
                )}

            </div>
        </div>
    );
};

export default HomePage;
