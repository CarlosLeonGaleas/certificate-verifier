import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import AppBarCustom from './components/AppBarCustom.tsx'
import './App.css'
import DrawerMenu from './components/DrawerMenu.tsx'

function App() {
  const [count, setCount] = useState(0)
  const [openOptions, setOpenOptions] = useState(false)

  return (
    <div className="App">
      <AppBarCustom openOptions={openOptions} handleDrawerToggle={() => setOpenOptions(!openOptions)}></AppBarCustom>
      <DrawerMenu open={openOptions} handleClose={() => setOpenOptions(false)} />
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </div>
  )
}

export default App
