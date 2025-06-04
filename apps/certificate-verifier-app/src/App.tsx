import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import AppBarCustom from './components/AppBarCustom'
import DrawerMenu from './components/DrawerMenu'
import HomePage from './components/HomePage'
import HashVerifierPage from './components/HashVerifierPage'
import IdVerifierPage from './components/IdVerifierPage'

function App() {
  const [openOptions, setOpenOptions] = useState(true) // true = Drawer expandido

  // Tamaños fijos según diseño
  const drawerWidth = openOptions ? 260 : 65
  const appBarHeight = 64

  return (
    <Router>
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
              height: `calc(100vh - ${appBarHeight}px)`,
              width: `calc(100vh - ${drawerWidth}px)`
            }}
          >
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/hash" element={<HashVerifierPage />} />
              <Route path="/id" element={<IdVerifierPage />} />
              <Route path="/id/:id" element={<IdVerifierPage />} />
              <Route path="/ci" element={<HashVerifierPage />} />
              <Route path="/institution" element={<HashVerifierPage />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  )
}

export default App
