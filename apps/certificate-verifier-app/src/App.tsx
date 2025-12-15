import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import AppBarCustom from './components/AppBarCustom'
import DrawerMenu from './components/DrawerMenu'
import HomePage from './components/HomePage'
import HashVerifierPage from './components/HashVerifierPage'
import IdVerifierPage from './components/IdVerifierPage'
import StepLoader from './components/StepLoader'
import DocumentIdPage from './components/DocumentIdPage'
import { InstitutionProvider } from './contexts/InstitutionContext'

function App() {
  const [openOptions, setOpenOptions] = useState(true)

  const drawerWidth = openOptions ? 260 : 65
  const appBarHeight = 64

  return (
    <Router>
      <InstitutionProvider>
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
          {/* AppBar arriba */}
          <AppBarCustom
            openOptions={openOptions}
            handleDrawerToggle={() => setOpenOptions(!openOptions)}
          />

          {/* Área principal */}
          <div style={{ display: 'flex', flex: 1, width: '100%' }}>
            {/* Drawer a la izquierda */}
            <div style={{ width: drawerWidth, transition: 'width 0.3s' }}>
              <DrawerMenu open={openOptions} handleClose={() => setOpenOptions(false)} />
            </div>

            {/* Contenido dinámico a la derecha */}
            <main
              style={{
                flexGrow: 1,
                backgroundColor: '#f0f0f0',
                marginTop: `${appBarHeight}px`,
                height: 'auto',
                overflow: 'auto',
                width: '100%',
                minHeight: `calc(100vh - ${appBarHeight}px)`,
                maxHeight: '100%'
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
            </main>
          </div>
        </div>
      </InstitutionProvider>
    </Router>
  )
}

export default App