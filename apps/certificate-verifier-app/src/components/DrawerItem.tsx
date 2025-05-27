import type { FC } from 'react';
import { ListItem, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';

interface DrawerItemProps {
  label: string;
  icon: React.ElementType;
  onClick: (label: string) => void;
}

const DrawerItem: FC<DrawerItemProps> = ({ label, icon: Icon, onClick }) => {
  return (
    <ListItem key={label} disablePadding sx={{ display: 'block' }}>
      <ListItemButton onClick={() => onClick(label)}>
        <ListItemIcon>
          <Icon style={{ color: 'white' }} />
        </ListItemIcon>
        <ListItemText primary={<strong>{label}</strong>} />
      </ListItemButton>
    </ListItem>
  );
};

export default DrawerItem;
