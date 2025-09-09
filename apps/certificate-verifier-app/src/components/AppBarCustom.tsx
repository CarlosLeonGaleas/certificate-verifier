import { styled } from '@mui/material/styles'
import MuiAppBar, { type AppBarProps as MuiAppBarProps } from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import MenuIcon from '@mui/icons-material/Menu'
import { Box } from '@mui/material'

const UniversitarioRU_Azul = '/UniversitarioRU_Azul.svg'
const Investigacion_Color = '/Investigacion_Color.svg'

const drawerWidth = 260

interface AppBarCustomProps {
  openOptions: boolean
  handleDrawerToggle: () => void
}

interface AppBarStyleProps extends MuiAppBarProps {
  openOptions?: boolean
}

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'openOptions'
})<AppBarStyleProps>(({ theme, openOptions }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(['width', 'margin'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen
  }),
  ...(openOptions && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen
    })
  })
}))

const AppBarCustom: React.FC<AppBarCustomProps> = ({ openOptions, handleDrawerToggle }) => {
  const isDarkMode = false
  const appBarBgColor = isDarkMode ? 'black' : 'white'
  const appBarColor = isDarkMode ? 'white' : 'rgb(39, 52, 139)'
  return (
    <AppBar position="fixed" openOptions={openOptions} sx={{ backgroundColor: appBarBgColor, color: appBarColor }}>
      <Toolbar>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={handleDrawerToggle}
          sx={{
            marginRight: 2,
            ...(openOptions && { display: 'none' })
          }}
        >
          <MenuIcon />
        </IconButton>
        <Box sx={{ display: 'flex', width: '100%', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
        {!openOptions &&<img
          src={UniversitarioRU_Azul}
          alt="Universitario Rumiñahui"
          style={{ width: 150, height: 35 }}
        />}
        <Typography variant="h6" noWrap component="div">
          <strong>VALIDAR CERTIFICADOS EN LA BLOCKCHAIN</strong>
        </Typography>
        {!openOptions &&<img
          src={Investigacion_Color}
          alt="Investigación"
          style={{ width: 150, height: 35 }}
        />}
        </Box>
      </Toolbar>
    </AppBar>
  )
}

export default AppBarCustom
