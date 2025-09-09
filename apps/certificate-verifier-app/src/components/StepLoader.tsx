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
  active: boolean;
  completed: boolean;
  onFinish: () => void;
}

const StepLoader: React.FC<StepLoaderProps> = ({ finalSuccess, active, completed, onFinish}) => {
  const [statuses, setStatuses] = useState<StepStatus[]>(['idle', 'idle', 'idle']);
  const [progress1, setProgress1] = useState(0);
  const [buffer1, setBuffer1] = useState(10);
  const [progress2, setProgress2] = useState(0);
  const [buffer2, setBuffer2] = useState(10);

  const isProcessingStep = useRef(false);
  const isBuffering = useRef(false);

  // Reset / start when active changes
  useEffect(() => {
    if (!active) {
      setStatuses(['idle', 'idle', 'idle']);
      setProgress1(0);
      setBuffer1(10);
      setProgress2(0);
      setBuffer2(10);
      isProcessingStep.current = false;
      isBuffering.current = false;
      return;
    }

    runStep(0);
  }, [active]);

  // Si API terminó y estamos en step 2 → esperar unos segundos y luego marcar success/error
  useEffect(() => {
    if (completed && statuses[2] === 'loading') {
      const timer = setTimeout(() => {
        setStatuses(prev => {
          const updated = [...prev];
          updated[2] = finalSuccess ? 'success' : 'error';
          return updated;
        });

        // Avisar al padre que ya terminó toda la animación
        setTimeout(onFinish, 800); // pequeño delay extra opcional
      }, 2000); // ⏳ tiempo mínimo del step 2

      return () => clearTimeout(timer);
    }
  }, [completed, finalSuccess, statuses, onFinish]);

  const runStep = (stepIndex: number) => {
    if (stepIndex >= 3 || isProcessingStep.current) return;
    isProcessingStep.current = true;

    setStatuses(prev => {
      const updated = [...prev];
      updated[stepIndex] = 'loading';
      return updated;
    });

    setTimeout(() => {
      // 👉 Step 2 ya no se completa aquí
      if (stepIndex < 2) {
        setStatuses(prev => {
          const updated = [...prev];
          updated[stepIndex] = 'success';
          return updated;
        });

        if (stepIndex === 0) startBuffer(1);
        if (stepIndex === 1) startBuffer(2);
      }

      isProcessingStep.current = false;
    }, 1500);
  };

  const startBuffer = (which: 1 | 2) => {
    if (isBuffering.current) return;
    isBuffering.current = true;

    let progress = 0;
    let buffer = 10;

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
        isBuffering.current = false;
        runStep(which); // which=1 → step1, which=2 → step2
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
              color: 'white',
              bgcolor: isSuccess
                ? green[500]
                : isError
                ? red[500]
                : '#27348b',
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