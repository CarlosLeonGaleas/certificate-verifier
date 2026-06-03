import { styled } from '@mui/material/styles';
import type { CSSObject, Theme } from '@mui/system';

import { List, Box, Divider, Drawer as MuiDrawer } from '@mui/material';
import type { DrawerProps as MuiDrawerProps } from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';

import DrawerItem from './DrawerItem'
import { drawerItemsVerifier, drawerItemsSearch } from '../icons/index'

import { useInstitution } from '../contexts/InstitutionContext'

const InvestigacionLogoVerticalBlanco = '/Investigacion_LogoVerticalBlanco.svg'
const InvestigacionLupaBlanca = '/Investigacion_LupaBlanca.svg'

const openedMixin = (theme: Theme): CSSObject => ({
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen
  }),
  overflowX: 'hidden'
})

const closedMixin = (theme: Theme): CSSObject => ({
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen
  }),
  overflowX: 'hidden',
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up('sm')]: {
    width: `calc(${theme.spacing(8)} + 1px)`
  }
})

interface StyledDrawerProps extends MuiDrawerProps {
  open: boolean
  drawerwidth: number
}

const StyledDrawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== 'open' && prop !== 'drawerwidth'
})<StyledDrawerProps>(({ theme, open, drawerwidth }) => ({
  width: drawerwidth,
  flexShrink: 0,
  whiteSpace: 'nowrap',
  boxSizing: 'border-box',
  ...(open
    ? {
      ...openedMixin(theme),
      '& .MuiDrawer-paper': {
        ...openedMixin(theme),
        width: drawerwidth,
      }
    }
    : {
      ...closedMixin(theme),
      '& .MuiDrawer-paper': closedMixin(theme)
    })
}))

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar
}))

type DrawerMenuProps = {
  open: boolean
  handleClose: () => void
  isMobile: boolean
  drawerWidth: number
}

const DrawerMenu = ({ open, handleClose, isMobile, drawerWidth }: DrawerMenuProps) => {
  const { config, isITCA } = useInstitution()

  const drawerContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100dvh' }}>
      <Box>
        <DrawerHeader
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: config.appBarBgColor
          }}
        >
          <img
            src={config.logo}
            alt="Universitario"
            className="universitario-logo"
            style={{ width: 200, height: 40 }}
          />
          <IconButton onClick={handleClose} sx={{ color: config.primaryColor }} size="medium">
            <ChevronLeftIcon />
          </IconButton>
        </DrawerHeader>
        <Divider />
        {open && (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingLeft: 2,
              paddingTop: 0.25,
              marginBottom: -1.25
            }}
          >
            <p>
              <strong>VERIFICAR CERTIFICADO</strong>
            </p>
          </Box>
        )}
        <List>
          {drawerItemsVerifier.map((item) => (
            <DrawerItem key={item.text} label={item.text} icon={item.icon} onNavigate={isMobile ? handleClose : undefined} />
          ))}
        </List>
        <Divider />
        {open && (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingLeft: 2,
              paddingTop: 0.25,
              marginBottom: -1.25
            }}
          >
            <p>
              <strong>BUSCAR CERTIFICADOS</strong>
            </p>
          </Box>
        )}
        <List>
          {drawerItemsSearch.map((item) => (
            <DrawerItem key={item.text} label={item.text} icon={item.icon} onNavigate={isMobile ? handleClose : undefined} />
          ))}
        </List>
      </Box>
      <Box sx={{ textAlign: 'center', mb: 2 }}>
        {open && !isITCA && (
          <img
            src={InvestigacionLogoVerticalBlanco}
            alt="Departamento de Investigación"
            className="investigacion-logo"
            style={{ width: 220 }}
          />
        )}
        {!open && !isITCA && (
          <img
            src={InvestigacionLupaBlanca}
            alt="Departamento de Investigación"
            className="investigacion-logo"
            style={{ width: 40 }}
          />
        )}
      </Box>
    </Box>
  )

  const drawerStyles = {
    '& .MuiDrawer-paper': {
      backgroundColor: config.drawerBgColor,
      color: 'white',
      borderBlockColor: config.drawerBgColor,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      height: '100vh',
      borderRight: 'none'
    }
  }

  // Drawer temporal para móvil (overlay)
  if (isMobile) {
    return (
      <MuiDrawer
        variant="temporary"
        open={open}
        onClose={handleClose}
        ModalProps={{
          keepMounted: true, // Mejor rendimiento en móvil
        }}
        sx={{
          ...drawerStyles,
          '& .MuiDrawer-paper': {
            ...drawerStyles['& .MuiDrawer-paper'],
            width: drawerWidth,
          },
        }}
      >
        {drawerContent}
      </MuiDrawer>
    )
  }

  // Drawer permanente para desktop
  return (
    <StyledDrawer
      variant="permanent"
      open={open}
      drawerwidth={drawerWidth}
      sx={drawerStyles}
    >
      {drawerContent}
    </StyledDrawer>
  )
}

export default DrawerMenu