import { styled } from '@mui/material/styles';
import type { CSSObject, Theme } from '@mui/system';

import { List, Box, Divider } from '@mui/material';
import MuiDrawer from '@mui/material/Drawer';
import type { DrawerProps as MuiDrawerProps } from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';

import DrawerItem from './DrawerItem'
import { drawerItemsVerifier, drawerItemsSearch } from '../icons/index'

const UniversitarioRU_Blanco = '/UniversitarioRU_Blanco.svg'
const UniversitarioRU_Azul = '/UniversitarioRU_Azul.svg'
const InvestigacionLogoVerticalBlanco = '/Investigacion_LogoVerticalBlanco.svg'

const drawerWidth = 260

const openedMixin = (theme: Theme): CSSObject => ({
  width: drawerWidth,
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

interface DrawerProps extends MuiDrawerProps {
  open: boolean
}

const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== 'open'
})<DrawerProps>(({ theme, open }) => ({
  width: drawerWidth,
  flexShrink: 0,
  whiteSpace: 'nowrap',
  boxSizing: 'border-box',
  ...(open
    ? {
        ...openedMixin(theme),
        '& .MuiDrawer-paper': openedMixin(theme)
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
}

const DrawerMenu = ({ open, handleClose }: DrawerMenuProps) => {
  const isDarkMode = false
  const drawerBgColor = isDarkMode ? 'rgb(23, 23, 23)' : 'rgb(39, 52, 139)'
  const drawerHeaderBgColor = isDarkMode ? 'black' : 'white'
  const iconColor = isDarkMode ? 'white' : 'rgb(39, 52, 139)'

  return (
    <Drawer
      variant="permanent"
      open={open}
      sx={{
        '& .MuiDrawer-paper': {
          backgroundColor: drawerBgColor,
          color: 'white',
          borderBlockColor: drawerBgColor,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          height: '100vh',
          borderRight: 'none'
        }
      }}
    >
      <Box>
        <DrawerHeader
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: drawerHeaderBgColor
          }}
        >
          {isDarkMode ? (
            <img
              src={UniversitarioRU_Blanco}
              alt="Universitario"
              className="universitario-logo"
              style={{ width: 200, height: 40 }}
            />
          ) : (
            <img
              src={UniversitarioRU_Azul}
              alt="Universitario"
              className="universitario-logo"
              style={{ width: 200, height: 40 }}
            />
          )}
          <IconButton onClick={handleClose} sx={{ color: iconColor }} size="medium">
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
            <DrawerItem key={item.text} label={item.text} icon={item.icon} />
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
            <DrawerItem key={item.text} label={item.text} icon={item.icon} />
          ))}
        </List>
      </Box>
      <Box sx={{ textAlign: 'center', mb: 2 }}>
        {open && (
          <img
            src={InvestigacionLogoVerticalBlanco}
            alt="Departamento de Investigación"
            className="investigacion-logo"
            style={{ width: 220, height: 150 }}
          />
        )}
      </Box>
    </Drawer>
  )
}

export default DrawerMenu
