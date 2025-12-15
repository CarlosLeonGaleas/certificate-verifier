import type { FC } from 'react';
import { ListItem, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useInstitution } from '../contexts/InstitutionContext';

interface DrawerItemProps {
  label: string;
  icon: React.ElementType;
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

const DrawerItem: FC<DrawerItemProps> = ({ label, icon: Icon }) => {
  const navigate = useNavigate();
  const { isITCA } = useInstitution();
  
  return (
    <ListItem key={label} disablePadding sx={{ display: 'block' }}>
      <ListItemButton onClick={() => navigate(handleRoute(label, isITCA))}>
        <ListItemIcon>
          <Icon style={{ color: 'white' }} />
        </ListItemIcon>
        <ListItemText primary={<strong>{label}</strong>} />
      </ListItemButton>
    </ListItem>
  );
};

export default DrawerItem;
