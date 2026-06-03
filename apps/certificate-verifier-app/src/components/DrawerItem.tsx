import type { FC } from 'react';
import { ListItem, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useInstitution } from '../contexts/InstitutionContext';

interface DrawerItemProps {
  label: string;
  icon: React.ElementType;
  onNavigate?: () => void;
}

function handleRoute(option: string, isITCA: boolean): string {
  // Prefijo según la institución
  const prefix = isITCA ? '/ITCA' : '';

  switch (option) {
    case 'Hash':
      return `${prefix}/hash`;
    case 'Id':
      return `${prefix}/id`;
    case 'Cédula de Identidad':
      return `${prefix}/documentId`;
    case 'Institución':
      return `${prefix}/institution`;
    default:
      return prefix || '/';
  }
}

const DrawerItem: FC<DrawerItemProps> = ({ label, icon: Icon, onNavigate }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { config, isITCA } = useInstitution();

  const targetRoute = handleRoute(label, isITCA);
  const isRoot = targetRoute === '/' || targetRoute === '/ITCA';

  // Comprueba si la ruta actual coincide con la ruta del elemento
  const isActive = isRoot
    ? location.pathname === targetRoute
    : location.pathname.startsWith(targetRoute);

  const handleClick = () => {
    navigate(targetRoute);
    // Cerrar el drawer en móvil después de navegar
    if (onNavigate) {
      onNavigate();
    }
  };

  return (
    <ListItem key={label} disablePadding sx={{ display: 'block' }}>
      <ListItemButton
        onClick={handleClick}
        sx={{
          borderLeft: `4px solid ${isActive ? config.secondaryColor : 'transparent'}`,
          backgroundColor: isActive ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
          color: isActive ? (isITCA ? config.secondaryColor : '#ffffff') : 'rgba(255, 255, 255, 0.8)',
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.15)',
          },
          transition: 'all 0.2s ease-in-out',
        }}
      >
        <ListItemIcon sx={{ minWidth: 40 }}>
          <Icon
            sx={{
              color: isActive ? (isITCA ? config.secondaryColor : '#ffffff') : 'rgba(255, 255, 255, 0.6)',
              transition: 'color 0.2s ease-in-out'
            }}
          />
        </ListItemIcon>
        <ListItemText
          primary={<strong>{label}</strong>}
          sx={{
            margin: 0,
            paddingLeft: '8px',
            '& .MuiTypography-root': {
              fontSize: '0.9rem',
              fontWeight: isActive ? 600 : 500,
            }
          }}
        />
      </ListItemButton>
    </ListItem>
  );
};

export default DrawerItem;