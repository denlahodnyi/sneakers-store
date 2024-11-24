'use client';

import { LogoutOutlined, MenuOutlined } from '@mui/icons-material';
import {
  AppBar,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
} from '@mui/material';
import { useState } from 'react';

function TopBar({ logoutServerFn }: { logoutServerFn: () => Promise<never> }) {
  const [menuIsOpened, setMenuIsOpened] = useState(true);
  return (
    <>
      <AppBar
        position="fixed"
        sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            sx={{ mr: 6 }}
            onClick={() => setMenuIsOpened(!menuIsOpened)}
          >
            <MenuOutlined />
          </IconButton>
          <Typography noWrap component="div" variant="h6">
            Store dashboard
          </Typography>
        </Toolbar>
      </AppBar>
      <Drawer open={menuIsOpened} sx={{ width: 240 }} variant="persistent">
        <Toolbar />
        <List>
          <ListItem disablePadding>
            <ListItemButton
              onClick={async () => {
                await logoutServerFn();
              }}
            >
              <ListItemIcon>
                <LogoutOutlined />
              </ListItemIcon>
              <ListItemText primary="Logout" />
            </ListItemButton>
          </ListItem>
        </List>
      </Drawer>
    </>
  );
}

export default TopBar;
