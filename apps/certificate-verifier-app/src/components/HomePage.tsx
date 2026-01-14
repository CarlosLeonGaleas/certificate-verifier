import React from 'react'
import { Box, Typography, Container, Link, Divider, useTheme, useMediaQuery } from '@mui/material'
import EmailIcon from '@mui/icons-material/Email'
import CodeIcon from '@mui/icons-material/Code'
import CopyrightIcon from '@mui/icons-material/Copyright'
import RUlogoAzul from '/RU_Azul.svg'

const HomePage: React.FC = () => {
    const theme = useTheme()
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
    const isTablet = useMediaQuery(theme.breakpoints.down('md'))

    return (
        <Box
            sx={{
                backgroundColor: '#e3f2fd',
                color: '#27348f',
                minHeight: '100%',
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
            }}
        >
            {/* Contenido principal */}
            <Container
                maxWidth="lg"
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexGrow: 1,
                    py: { xs: 4, sm: 6, md: 8 },
                    px: { xs: 2, sm: 3 }
                }}
            >
                <Box
                    sx={{
                        mb: { xs: 3, sm: 4, md: 5 },
                        textAlign: 'center'
                    }}
                >
                    <Box
                        component="img"
                        src={RUlogoAzul}
                        alt="Rumiñahui logo"
                        sx={{
                            width: { xs: '80%', sm: '70%', md: '60%' },
                            maxWidth: '500px',
                            height: 'auto',
                            objectFit: 'contain'
                        }}
                    />
                </Box>

                <Typography
                    variant={isMobile ? 'h6' : isTablet ? 'h5' : 'h4'}
                    component="h1"
                    align="center"
                    sx={{
                        fontWeight: 'bold',
                        mb: 2,
                        px: { xs: 1, sm: 2 },
                        fontSize: { xs: '1.1rem', sm: '1.5rem', md: '2rem' }
                    }}
                >
                    VALIDAR CERTIFICADOS EMITIDOS EN LA BLOCKCHAIN DEL
                </Typography>

                <Typography
                    variant={isMobile ? 'h6' : isTablet ? 'h5' : 'h4'}
                    component="h2"
                    align="center"
                    sx={{
                        fontWeight: 'bold',
                        px: { xs: 1, sm: 2 },
                        fontSize: { xs: '1.1rem', sm: '1.5rem', md: '2rem' }
                    }}
                >
                    INSTITUTO TECNOLÓGICO SUPERIOR UNIVERSITARIO RUMIÑAHUI
                </Typography>
            </Container>

            {/* Footer */}
            <Box
                component="footer"
                sx={{
                    backgroundColor: '#e3f2fd',
                    color: '#27348f',
                    py: { xs: 2, sm: 3 },
                    px: { xs: 2, sm: 3 },
                    mt: 'auto'
                }}
            >
                <Container maxWidth="lg">
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: { xs: 'column', md: 'row' },
                            justifyContent: 'space-between',
                            alignItems: { xs: 'center', md: 'flex-start' },
                            gap: { xs: 2, md: 3 }
                        }}
                    >
                        {/* Copyright */}
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                                textAlign: { xs: 'center', md: 'left' }
                            }}
                        >
                            <CopyrightIcon fontSize="small" />
                            <Typography variant="body2">
                                {new Date().getFullYear()} Departamento de Investigación
                            </Typography>
                        </Box>

                        {/* Divider vertical en desktop, horizontal en móvil */}
                        {!isMobile && !isTablet && (
                            <Divider orientation="vertical" flexItem sx={{ borderColor: 'rgba(0, 0, 0, 0.3)' }} />
                        )}
                        {(isMobile || isTablet) && (
                            <Divider sx={{ width: '100%', borderColor: 'rgba(0, 0, 0, 0.3)' }} />
                        )}

                        {/* Desarrolladores */}
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                                textAlign: { xs: 'center', md: 'left' }
                            }}
                        >
                            <CodeIcon fontSize="small" />
                            <Link
                                href="https://www.linkedin.com/in/carlos-león-galeas/"
                                target="_blank"
                                rel="noopener noreferrer"
                                color="inherit"
                                underline="hover"
                                sx={{
                                    fontSize: '0.875rem',
                                    '&:hover': {
                                        color: '#3b4fdb'
                                    }
                                }}
                            >
                                Desarrollado por: Carlos León Galeas
                            </Link>
                        </Box>

                        {/* Divider */}
                        {!isMobile && !isTablet && (
                            <Divider orientation="vertical" flexItem sx={{ borderColor: 'rgba(0, 0, 0, 0.3)' }} />
                        )}
                        {(isMobile || isTablet) && (
                            <Divider sx={{ width: '100%', borderColor: 'rgba(0, 0, 0, 0.3)' }} />
                        )}

                        {/* Contacto */}
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1
                            }}
                        >
                            <EmailIcon fontSize="small" />
                            <Link
                                href="mailto:investigacion@ister.edu.ec"
                                color="inherit"
                                underline="hover"
                                sx={{
                                    fontSize: '0.875rem',
                                    '&:hover': {
                                        color: '#3b4fdb'
                                    }
                                }}
                            >
                                investigacion@ister.edu.ec
                            </Link>
                        </Box>
                    </Box>

                    {/* Línea adicional de información */}
                    {/* <Box sx={{ mt: 2, textAlign: 'center' }}>
                        <Typography variant="caption" sx={{ opacity: 0.8 }}>
                            Sistema de Validación de Certificados mediante Blockchain
                        </Typography>
                    </Box> */}
                </Container>
            </Box>
        </Box>
    )
}

export default HomePage