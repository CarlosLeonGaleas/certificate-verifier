import { styled } from '@mui/material/styles'
import MuiAppBar, { type AppBarProps as MuiAppBarProps } from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import MenuIcon from '@mui/icons-material/Menu'
import { Box, useMediaQuery, useTheme } from '@mui/material'

import { useInstitution } from '../contexts/InstitutionContext'

const drawerWidth = 260

interface AppBarCustomProps {
  openOptions: boolean
  handleDrawerToggle: () => void
  isMobile: boolean
}

interface AppBarStyleProps extends MuiAppBarProps {
  openOptions?: boolean
  ismobile?: string
}

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'openOptions' && prop !== 'ismobile'
})<AppBarStyleProps>(({ theme, openOptions, ismobile }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(['width', 'margin'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen
  }),
  // En desktop, si el drawer está abierto, el AppBar se reduce
  ...(openOptions && ismobile === 'false' && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen
    })
  })
}))

const AppBarCustom: React.FC<AppBarCustomProps> = ({ openOptions, handleDrawerToggle, isMobile }) => {
  const { config } = useInstitution()
  const theme = useTheme()
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'))

  return (
    <AppBar 
      position="fixed" 
      openOptions={openOptions} 
      ismobile={isMobile.toString()}
      sx={{ backgroundColor: config.appBarBgColor, color: config.primaryColor }}
    >
      <Toolbar sx={{ minHeight: { xs: 56, sm: 64 } }}>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={handleDrawerToggle}
          sx={{
            marginRight: { xs: 1, sm: 2 },
            // En desktop, ocultar cuando el drawer está abierto
            ...(!isMobile && openOptions && { display: 'none' })
          }}
        >
          <MenuIcon />
        </IconButton>
        
        <Box 
          sx={{ 
            display: 'flex', 
            width: '100%', 
            alignItems: 'center', 
            justifyContent: 'space-between', 
            gap: { xs: 1, sm: 2 }
          }}
        >
          <Typography 
            variant={isSmallScreen ? 'body1' : 'h6'} 
            noWrap 
            component="div"
            sx={{
              fontSize: { xs: '0.875rem', sm: '1rem', md: '1.25rem' },
              flexGrow: 1,
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
          >
            <strong>{isSmallScreen ? 'VALIDAR CERTIFICADOS' : 'VALIDAR CERTIFICADOS BLOCKCHAIN'}</strong>
          </Typography>
          
          {/* Logo solo visible en desktop cuando el drawer está cerrado */}
          {!isMobile && !openOptions && (
            <Box
              component="img"
              src={config.logo}
              alt="Logo"
              sx={{
                width: { sm: 150, md: 200 },
                height: { sm: 30, md: 40 },
                objectFit: 'contain'
              }}
            />
          )}
          
          {/* Logo en móvil - más pequeño */}
          {isMobile && !isSmallScreen && (
            <Box
              component="img"
              src={config.logo}
              alt="Logo"
              sx={{
                width: 120,
                height: 30,
                objectFit: 'contain'
              }}
            />
          )}
        </Box>
      </Toolbar>
    </AppBar>
  )
}

export default AppBarCustom