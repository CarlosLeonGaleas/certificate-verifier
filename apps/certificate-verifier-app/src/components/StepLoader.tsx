import React, { useEffect, useState, useRef } from 'react';
import { Box, CircularProgress, Fab, LinearProgress, Typography } from '@mui/material';
import { green, red } from '@mui/material/colors';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import LinkIcon from '@mui/icons-material/Link';
import SearchIcon from '@mui/icons-material/Search';
import DescriptionIcon from '@mui/icons-material/Description';

type StepStatus = 'idle' | 'loading' | 'success' | 'error';

interface StepLoaderProps {
  finalSuccess: boolean;
}

const StepLoader: React.FC<StepLoaderProps> = ({ finalSuccess }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [statuses, setStatuses] = useState<StepStatus[]>(['idle', 'idle', 'idle']);
  const [progress1, setProgress1] = useState(0);
  const [buffer1, setBuffer1] = useState(10);
  const [progress2, setProgress2] = useState(0);
  const [buffer2, setBuffer2] = useState(10);
  
  const isProcessingStep = useRef(false);
  const isBuffering = useRef(false);
  const hasStarted = useRef(false);

  // Efecto para inicializar/resetear el componente
  useEffect(() => {
    console.log('Componente montado/reseteado');
    setCurrentStep(0);
    setStatuses(['idle', 'idle', 'idle']);
    setProgress1(0);
    setBuffer1(10);
    setProgress2(0);
    setBuffer2(10);
    isProcessingStep.current = false;
    isBuffering.current = false;
    hasStarted.current = false;
  }, []); // Solo al montar

  // Efecto para iniciar la secuencia
  useEffect(() => {
    if (hasStarted.current) return;
    
    hasStarted.current = true;
    console.log('Iniciando secuencia desde el paso 0');
    
    const startSequence = () => {
      runStep(0);
    };

    // Pequeño delay para asegurar que el componente esté completamente renderizado
    const timer = setTimeout(startSequence, 100);
    
    return () => clearTimeout(timer);
  }, []);

  const runStep = (stepIndex: number) => {
    if (stepIndex >= 3 || isProcessingStep.current) {
      console.log(`No se puede ejecutar paso ${stepIndex}, condiciones: stepIndex >= 3: ${stepIndex >= 3}, isProcessing: ${isProcessingStep.current}`);
      return;
    }

    console.log(`Ejecutando paso ${stepIndex}`);
    isProcessingStep.current = true;

    // Marcar el paso como loading
    setStatuses((prev) => {
      const updated = [...prev];
      updated[stepIndex] = 'loading';
      return updated;
    });

    // Después de 1.5 segundos, marcar como success/error
    const stepTimeout = setTimeout(() => {
      console.log(`Completando paso ${stepIndex}`);
      
      setStatuses((prev) => {
        const updated = [...prev];
        if (stepIndex === 2 && !finalSuccess) {
          updated[stepIndex] = 'error';
        } else {
          updated[stepIndex] = 'success';
        }
        return updated;
      });

      isProcessingStep.current = false;

      // Si no es el último paso, iniciar el buffer correspondiente
      if (stepIndex === 0) {
        console.log('Iniciando buffer 1');
        startBuffer(1);
      } else if (stepIndex === 1) {
        console.log('Iniciando buffer 2');
        startBuffer(2);
      }
      // Si es el paso 2, terminamos
    }, 1500);
  };

  const startBuffer = (which: 1 | 2) => {
    if (isBuffering.current) {
      console.log(`Ya se está ejecutando un buffer, saltando buffer ${which}`);
      return;
    }
    
    isBuffering.current = true;
    let progress = 0;
    let buffer = 10;
    
    console.log(`Iniciando progreso del buffer ${which}`);
    
    // Resetear el progreso correspondiente
    if (which === 1) {
      setProgress1(0);
      setBuffer1(10);
    } else {
      setProgress2(0);
      setBuffer2(10);
    }

    const interval = setInterval(() => {
      progress += 10;
      buffer = Math.min(100, buffer + 4 + Math.random() * 5);
      
      if (which === 1) {
        setProgress1(progress);
        setBuffer1(buffer);
      } else {
        setProgress2(progress);
        setBuffer2(buffer);
      }

      if (progress >= 100) {
        clearInterval(interval);
        console.log(`Buffer ${which} completado`);
        isBuffering.current = false;
        
        // Ejecutar el siguiente paso
        const nextStep = which; // which 1 -> step 1, which 2 -> step 2
        console.log(`Ejecutando siguiente paso: ${nextStep}`);
        runStep(nextStep);
      }
    }, 80);
  };

  const icons = [<LinkIcon key="link" />, <SearchIcon key="search" />, <DescriptionIcon key="desc" />];
  const labels = [
    'Conectando a la Blockchain...',
    'Buscando certificado...',
    'Recuperando los datos...',
  ];

  const renderStep = (index: number) => {
    const status = statuses[index];
    const isLoading = status === 'loading';
    const isSuccess = status === 'success';
    const isError = status === 'error';

    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '5px' }}>
        <Box sx={{ m: 1, position: 'relative' }}>
          <Fab
            sx={{
              bgcolor: isSuccess
                ? green[500]
                : isError
                ? red[500]
                : 'primary.main',
              '&:hover': {
                bgcolor: isSuccess
                  ? green[700]
                  : isError
                  ? red[700]
                  : 'primary.dark',
              },
            }}
          >
            {isSuccess ? <CheckIcon /> : isError ? <CloseIcon /> : icons[index]}
          </Fab>
          {isLoading && (
            <CircularProgress
              size={68}
              sx={{
                color: green[500],
                position: 'absolute',
                top: -6,
                left: -6,
                zIndex: 1,
              }}
            />
          )}
        </Box>
        <Typography variant="body2"><strong>{labels[index]}</strong></Typography>
      </Box>
    );
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      {renderStep(0)}
      <Box sx={{ width: 80 }}>
        <LinearProgress variant="buffer" value={progress1} valueBuffer={buffer1} />
      </Box>
      {renderStep(1)}
      <Box sx={{ width: 80 }}>
        <LinearProgress variant="buffer" value={progress2} valueBuffer={buffer2} />
      </Box>
      {renderStep(2)}
    </Box>
  );
};

export default StepLoader;