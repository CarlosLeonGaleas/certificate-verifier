import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useTheme, useMediaQuery, Box } from '@mui/material'
import AppBarCustom from './components/AppBarCustom'
import DrawerMenu from './components/DrawerMenu'
import HomePage from './components/HomePage'
import HashVerifierPage from './components/HashVerifierPage'
import IdVerifierPage from './components/IdVerifierPage'
import StepLoader from './components/StepLoader'
import DocumentIdPage from './components/DocumentIdPage'
import { InstitutionProvider } from './contexts/InstitutionContext'

const drawerWidth = 260

function App() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [desktopOpen, setDesktopOpen] = useState(true)
  
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  const handleDrawerToggle = () => {
    if (isMobile) {
      setMobileOpen(!mobileOpen)
    } else {
      setDesktopOpen(!desktopOpen)
    }
  }

  const handleDrawerClose = () => {
    if (isMobile) {
      setMobileOpen(false)
    } else {
      setDesktopOpen(false)
    }
  }

  return (
    <Router>
      <InstitutionProvider>
        <Box sx={{ display: 'flex', minHeight: '100vh' }}>
          {/* AppBar */}
          <AppBarCustom
            openOptions={isMobile ? mobileOpen : desktopOpen}
            handleDrawerToggle={handleDrawerToggle}
            isMobile={isMobile}
          />

          {/* Drawer */}
          <DrawerMenu
            open={isMobile ? mobileOpen : desktopOpen}
            handleClose={handleDrawerClose}
            isMobile={isMobile}
            drawerWidth={drawerWidth}
          />

          {/* Contenido principal */}
          <Box
            component="main"
            sx={{
              flexGrow: 1,
              backgroundColor: '#f0f0f0',
              height: 'auto',
              overflow: 'auto',
              mt: { xs: 7, sm: 8 }, // Margen top para el AppBar
              ml: isMobile ? 0 : (desktopOpen ? 0 : 0), // En desktop, el drawer empuja el contenido
              width: isMobile ? '100%' : (desktopOpen ? `calc(100% - ${drawerWidth}px)` : `calc(100% - ${theme.spacing(8)} - 1px)`),
              transition: theme.transitions.create(['margin', 'width'], {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.leavingScreen,
              }),
            }}
          >
            <Routes>
              {/* Rutas por defecto */}
              <Route path="/" element={<HomePage />} />
              <Route path="/hash" element={<HashVerifierPage />} />
              <Route path="/hash/:hash" element={<HashVerifierPage />} />
              <Route path="/id" element={<IdVerifierPage />} />
              <Route path="/id/:tokenId" element={<IdVerifierPage />} />
              <Route path="/documentId" element={<DocumentIdPage />} />
              <Route path="/documentId/:documentId" element={<DocumentIdPage />} />
              <Route path="/institution" element={<HomePage />} />
              <Route path="/loader" element={
                <StepLoader
                  finalSuccess={true}
                  active={true}
                  completed={true}
                  onFinish={() => console.log('Animation finished')}
                />
              } />

              {/* Rutas ITCA */}
              <Route path="/ITCA" element={<HomePage />} />
              <Route path="/ITCA/hash" element={<HashVerifierPage />} />
              <Route path="/ITCA/hash/:hash" element={<HashVerifierPage />} />
              <Route path="/ITCA/id" element={<IdVerifierPage />} />
              <Route path="/ITCA/id/:tokenId" element={<IdVerifierPage />} />
              <Route path="/ITCA/documentId" element={<DocumentIdPage />} />
              <Route path="/ITCA/documentId/:documentId" element={<DocumentIdPage />} />
            </Routes>
          </Box>
        </Box>
      </InstitutionProvider>
    </Router>
  )
}

export default App