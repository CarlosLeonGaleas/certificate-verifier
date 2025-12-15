import { createContext, useContext, ReactNode } from 'react'
import { useLocation } from 'react-router-dom'

interface InstitutionConfig {
  name: string
  logo: string
  primaryColor: string
  secondaryColor: string
  appBarBgColor: string
  drawerBgColor: string
}

interface InstitutionContextType {
  config: InstitutionConfig
  isITCA: boolean
}

const InstitutionContext = createContext<InstitutionContextType | undefined>(undefined)

// Configuraciones por institución
const DEFAULT_CONFIG: InstitutionConfig = {
  name: 'ISTER',
  logo: '/UniversitarioRU_Azul.svg',
  primaryColor: 'rgb(39, 52, 139)',
  secondaryColor: 'white',
  appBarBgColor: 'white',
  drawerBgColor: 'rgb(39, 52, 139)',
}

const ITCA_CONFIG: InstitutionConfig = {
  name: 'ITCA',
  logo: '/ITCA_VerdeAzul.svg',
  primaryColor: 'rgb(0, 72, 153)',
  secondaryColor: 'rgb(134, 188, 37)',
  appBarBgColor: 'white',
  drawerBgColor: 'rgb(0, 72, 153)',
}

export function InstitutionProvider({ children }: { children: ReactNode }) {
  const location = useLocation()
  
  // Detectar si la ruta actual es de ITCA
  const isITCA = location.pathname.startsWith('/ITCA')
  
  // Seleccionar configuración según la ruta
  const config = isITCA ? ITCA_CONFIG : DEFAULT_CONFIG

  return (
    <InstitutionContext.Provider value={{ config, isITCA }}>
      {children}
    </InstitutionContext.Provider>
  )
}

// Hook personalizado para usar el contexto
export function useInstitution() {
  const context = useContext(InstitutionContext)
  if (context === undefined) {
    throw new Error('useInstitution debe usarse dentro de InstitutionProvider')
  }
  return context
}