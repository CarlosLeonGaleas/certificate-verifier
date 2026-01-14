import type { FC } from 'react';
import { ListItem, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import { useNavigate } from 'react-router-dom';
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
  const { isITCA } = useInstitution();
  
  const handleClick = () => {
    navigate(handleRoute(label, isITCA));
    // Cerrar el drawer en móvil después de navegar
    if (onNavigate) {
      onNavigate();
    }
  };
  
  return (
    <ListItem key={label} disablePadding sx={{ display: 'block' }}>
      <ListItemButton onClick={handleClick}>
        <ListItemIcon>
          <Icon style={{ color: 'white' }} />
        </ListItemIcon>
        <ListItemText primary={<strong>{label}</strong>} />
      </ListItemButton>
    </ListItem>
  );
};

export default DrawerItem;