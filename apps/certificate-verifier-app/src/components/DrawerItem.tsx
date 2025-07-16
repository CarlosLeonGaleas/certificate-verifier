import type { FC } from 'react';
import { ListItem, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import { useNavigate } from 'react-router-dom';


interface DrawerItemProps {
  label: string;
  icon: React.ElementType;
}
function handleRoute(option: string): string {
  switch (option) {
    case 'Hash':
      return '/hash';
    case 'Id':
      return '/id';
    case 'Cédula de Identidad':
      return '/documentId';
    case 'Institución':
      return '/institution';
    default:
      return '/';
  }
}

const DrawerItem: FC<DrawerItemProps> = ({ label, icon: Icon }) => {
  const navigate = useNavigate();
  return (
    <ListItem key={label} disablePadding sx={{ display: 'block' }}>
      <ListItemButton onClick={() => navigate(handleRoute(label))}>
        <ListItemIcon>
          <Icon style={{ color: 'white' }} />
        </ListItemIcon>
        <ListItemText primary={<strong>{label}</strong>} />
      </ListItemButton>
    </ListItem>
  );
};

export default DrawerItem;
