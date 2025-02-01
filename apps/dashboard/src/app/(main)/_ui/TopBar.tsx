'use client';

import {
  CategoryOutlined,
  Copyright,
  HomeOutlined,
  Inventory2Outlined,
  InventoryOutlined,
  LogoutOutlined,
  MenuOutlined,
  Palette,
  People,
  StraightenOutlined,
} from '@mui/icons-material';
import {
  AppBar,
  Divider,
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
import Link from 'next/link';
import { useState } from 'react';

const drawerWidth = 240;

const links = [
  {
    href: '/',
    label: 'Home',
    icon: <HomeOutlined />,
  },
  {
    href: '/users',
    label: 'Users',
    icon: <People />,
  },
  {
    href: '/products',
    label: 'Products',
    icon: <InventoryOutlined />,
  },
  {
    href: '/product-variants',
    label: 'Product variants',
    icon: <InventoryOutlined />,
  },
  {
    href: '/skus',
    label: 'SKUs',
    icon: <Inventory2Outlined />,
  },
  {
    href: '/categories',
    label: 'Categories',
    icon: <CategoryOutlined />,
  },
  {
    href: '/brands',
    label: 'Brands',
    icon: <Copyright />,
  },
  {
    href: '/colors',
    label: 'Colors',
    icon: <Palette />,
  },
  {
    href: '/sizes',
    label: 'Sizes',
    icon: <StraightenOutlined />,
  },
];

function TopBar({
  logoutServerFn,
  userName,
}: {
  logoutServerFn: () => Promise<never>;
  userName: string;
}) {
  const [menuIsOpened, setMenuIsOpened] = useState(false);

  const drawerContent = (
    <List>
      {links.map(({ href, icon, label }, i) => (
        <ListItem key={i} disablePadding>
          <ListItemButton component={Link} href={href}>
            <ListItemIcon>{icon}</ListItemIcon>
            <ListItemText primary={label} />
          </ListItemButton>
        </ListItem>
      ))}
      <Divider />
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
  );

  return (
    <>
      <AppBar
        position="fixed"
        sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            sx={{ mr: 6, display: { xs: 'block', sm: 'none' } }}
            onClick={() => setMenuIsOpened(!menuIsOpened)}
          >
            <MenuOutlined />
          </IconButton>
          <Typography noWrap component="div" flexGrow={1} variant="h6">
            Store dashboard
          </Typography>
          <Typography component="div" variant="h6">
            {userName}
          </Typography>
        </Toolbar>
      </AppBar>

      {/* <Toolbar /> */}

      {/* Desktop drawer */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          display: { xs: 'none', sm: 'block' },
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
      >
        <Toolbar />
        {drawerContent}
      </Drawer>

      {/* Mobile drawer */}
      <Drawer
        open={menuIsOpened}
        variant="temporary"
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          width: drawerWidth,
          display: { xs: 'block', sm: 'none' },
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
      >
        <Toolbar />
        {drawerContent}
      </Drawer>
    </>
  );
}

export default TopBar;
