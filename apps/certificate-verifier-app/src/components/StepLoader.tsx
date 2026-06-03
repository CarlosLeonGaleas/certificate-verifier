import React, { useEffect, useState, useRef } from 'react';
import { Box, CircularProgress, Fab, LinearProgress, Typography, useTheme, useMediaQuery } from '@mui/material';
import { green, red } from '@mui/material/colors';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import LinkIcon from '@mui/icons-material/Link';
import SearchIcon from '@mui/icons-material/Search';
import DescriptionIcon from '@mui/icons-material/Description';

import { useInstitution } from '../contexts/InstitutionContext';

type StepStatus = 'idle' | 'loading' | 'success' | 'error';

interface StepLoaderProps {
  finalSuccess: boolean;
  active: boolean;
  completed: boolean;
  onFinish: () => void;
}

const StepLoader: React.FC<StepLoaderProps> = ({ finalSuccess, active, completed, onFinish }) => {
  const [statuses, setStatuses] = useState<StepStatus[]>(['idle', 'idle', 'idle']);
  const [progress1, setProgress1] = useState(0);
  const [buffer1, setBuffer1] = useState(10);
  const [progress2, setProgress2] = useState(0);
  const [buffer2, setBuffer2] = useState(10);

  const isProcessingStep = useRef(false);
  const isBuffering = useRef(false);

  const { config } = useInstitution();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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

  useEffect(() => {
    if (completed && statuses[2] === 'loading') {
      const timer = setTimeout(() => {
        setStatuses(prev => {
          const updated = [...prev];
          updated[2] = finalSuccess ? 'success' : 'error';
          return updated;
        });

        setTimeout(onFinish, 800);
      }, 2000);

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
        runStep(which);
      }
    }, 80);
  };

  const icons = [<LinkIcon key="link" />, <SearchIcon key="search" />, <DescriptionIcon key="desc" />];
  const labels = [
    'Conectando a la Blockchain...',
    'Buscando certificado...',
    'Recuperando los datos...',
  ];

  const labelsShort = [
    'Conectando...',
    'Buscando...',
    'Recuperando...',
  ];

  const renderStep = (index: number) => {
    const status = statuses[index];
    const isLoading = status === 'loading';
    const isSuccess = status === 'success';
    const isError = status === 'error';

    const fabSize = isMobile ? 48 : 56;
    const iconSize = isMobile ? 24 : 32;

    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          mt: { xs: 0.5, sm: 1 },
          minWidth: { xs: '80px', sm: '120px', md: '140px' }
        }}
      >
        <Box sx={{ m: { xs: 0.5, sm: 1 }, position: 'relative' }}>
          <Fab
            size={isMobile ? 'medium' : 'large'}
            sx={{
              color: 'white',
              width: fabSize,
              height: fabSize,
              bgcolor: isSuccess
                ? green[500]
                : isError
                  ? red[500]
                  : config.primaryColor,
              '&:hover': {
                bgcolor: isSuccess
                  ? green[700]
                  : isError
                    ? red[700]
                    : 'primary.dark',
              },
            }}
          >
            {isSuccess ? (
              <CheckIcon sx={{ fontSize: iconSize }} />
            ) : isError ? (
              <CloseIcon sx={{ fontSize: iconSize }} />
            ) : (
              React.cloneElement(icons[index], { sx: { fontSize: iconSize } })
            )}
          </Fab>
          {isLoading && (
            <CircularProgress
              size={fabSize + (isMobile ? 12 : 16)}
              sx={{
                color: green[500],
                position: 'absolute',
                top: isMobile ? -6 : -8,
                left: isMobile ? -6 : -8,
                zIndex: 1,
              }}
            />
          )}
        </Box>
        <Typography
          variant={isMobile ? 'caption' : 'body2'}
          sx={{
            textAlign: 'center',
            fontSize: { xs: '0.65rem', sm: '0.75rem', md: '0.875rem' },
            px: { xs: 0.5, sm: 1 },
            lineHeight: 1.2
          }}
        >
          <strong>{isMobile ? labelsShort[index] : labels[index]}</strong>
        </Typography>
      </Box>
    );
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: { xs: 0.5, sm: 1, md: 2 },
        flexWrap: { xs: 'nowrap', sm: 'nowrap' },
        justifyContent: 'center',
        width: '100%',
        maxWidth: '100%',
        overflowX: 'auto',
        py: { xs: 1, sm: 2 }
      }}
    >
      {renderStep(0)}
      <Box sx={{ flexGrow: 1, flexShrink: 1, minWidth: { xs: 10, sm: 20, md: 30 }, maxWidth: { xs: 40, sm: 60, md: 80 } }}>
        <LinearProgress variant="buffer" value={progress1} valueBuffer={buffer1} />
      </Box>
      {renderStep(1)}
      <Box sx={{ flexGrow: 1, flexShrink: 1, minWidth: { xs: 10, sm: 20, md: 30 }, maxWidth: { xs: 40, sm: 60, md: 80 } }}>
        <LinearProgress variant="buffer" value={progress2} valueBuffer={buffer2} />
      </Box>
      {renderStep(2)}
    </Box>
  );
};

export default StepLoader;