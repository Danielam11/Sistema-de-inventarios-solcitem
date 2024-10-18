import * as React from 'react';
import GlobalStyles from '@mui/joy/GlobalStyles';
import Avatar from '@mui/joy/Avatar';
import Box from '@mui/joy/Box';

import Divider from '@mui/joy/Divider';
import IconButton from '@mui/joy/IconButton';
import Input from '@mui/joy/Input';

import List from '@mui/joy/List';
import ListItem from '@mui/joy/ListItem';
import ListItemButton, { listItemButtonClasses } from '@mui/joy/ListItemButton';
import ListItemContent from '@mui/joy/ListItemContent';
import Typography from '@mui/joy/Typography';
import Sheet from '@mui/joy/Sheet';

import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import ShoppingCartRoundedIcon from '@mui/icons-material/ShoppingCartRounded';
import AssignmentRoundedIcon from '@mui/icons-material/AssignmentRounded';
import QuestionAnswerRoundedIcon from '@mui/icons-material/QuestionAnswerRounded';
import GroupRoundedIcon from '@mui/icons-material/GroupRounded';

import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';

import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import BrightnessAutoRoundedIcon from '@mui/icons-material/BrightnessAutoRounded';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

import ColorSchemeToggle from './ColorSchemeToggle.tsx';
import { closeSidebar } from './utils.ts';

function Toggler({
  defaultExpanded = false,
  renderToggle,
  children,
}: {
  defaultExpanded?: boolean;
  children: React.ReactNode;
  renderToggle: (params: {
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  }) => React.ReactNode;
}) {
  const [open, setOpen] = React.useState(defaultExpanded);
  return (
    <React.Fragment>
      {renderToggle({ open, setOpen })}
      <Box
        sx={[
          {
            display: 'grid',
            transition: '0.2s ease',
            '& > *': {
              overflow: 'hidden',
            },
          },
          open ? { gridTemplateRows: '1fr' } : { gridTemplateRows: '0fr' },
        ]}
      >
        {children}
      </Box>
    </React.Fragment>
  );
}

export default function Sidebar() {
  return (
    <Sheet
      className="Sidebar"
      sx={{
        position: { xs: 'fixed', md: 'sticky' },
        transform: {
          xs: 'translateX(calc(100% * (var(--SideNavigation-slideIn, 0) - 1)))',
          md: 'none',
        },
        transition: 'transform 0.4s, width 0.4s',
        zIndex: 10000,
        height: '100dvh',
        width: 'var(--Sidebar-width)',
        top: 0,
        p: 2,
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: 3,
        borderRight: '1px solid',
        borderColor: 'divider',
      }}
    >
      <GlobalStyles
        styles={(theme) => ({
          ':root': {
            '--Sidebar-width': '220px',
            [theme.breakpoints.up('lg')]: {
              '--Sidebar-width': '240px',
            },
          },
        })}
      />
      <Box
        className="Sidebar-overlay"
        sx={{
          position: 'fixed',
          zIndex: 9998,
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          opacity: 'var(--SideNavigation-slideIn)',
          backgroundColor: 'var(--joy-palette-background-backdrop)',
          transition: 'opacity 0.4s',
          transform: {
            xs: 'translateX(calc(100% * (var(--SideNavigation-slideIn, 0) - 1) + var(--SideNavigation-slideIn, 0) * var(--Sidebar-width, 0px)))',
            lg: 'translateX(-100%)',
          },
        }}
        onClick={() => closeSidebar()}
      />
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
        <IconButton variant="soft" color="primary" size="sm">
          <BrightnessAutoRoundedIcon />
        </IconButton>
        <Typography level="title-lg">Solcitem</Typography>
        <ColorSchemeToggle sx={{ ml: 'auto' }} />
      </Box>
      <Input size="sm" startDecorator={<SearchRoundedIcon />} placeholder="Search" />
      <Box
        sx={{
          minHeight: 0,
          overflow: 'hidden auto',
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          [`& .${listItemButtonClasses.root}`]: {
            gap: 1.5,
          },
        }}
      >
        <List
  size="sm"
  sx={{
    gap: 1, // Espacio uniforme entre los elementos de la lista
    '--List-nestedInsetStart': '30px',
    '--ListItem-radius': (theme) => theme.vars.radius.sm,
  }}
>
  <ListItem sx={{ mb: 1 }}> {/* Margen inferior para consistencia */}
    <ListItemButton>
      <HomeRoundedIcon />
      <ListItemContent>
        <Typography level="title-sm">Products</Typography>
      </ListItemContent>
    </ListItemButton>
  </ListItem>
  
  <ListItem sx={{ mb: 1 }}>
    <ListItemButton >
      <ShoppingCartRoundedIcon />
      <ListItemContent>
        <Typography level="title-sm">Inventory</Typography>
      </ListItemContent>
    </ListItemButton>
  </ListItem>


  <ListItem sx={{ mb: 1 }}>
    <ListItemButton>
      <DashboardRoundedIcon />
      <ListItemContent>
        <Typography level="title-sm">Clients</Typography>
      </ListItemContent>
    </ListItemButton>
  </ListItem>

  <ListItem sx={{ mb: 1 }}>
    <ListItemButton selected>
      <ShoppingCartRoundedIcon />
      <ListItemContent>
        <Typography level="title-sm">Sales</Typography>
      </ListItemContent>
    </ListItemButton>
  </ListItem>

  <ListItem nested>
    <Toggler
      renderToggle={({ open, setOpen }) => (
        <ListItemButton onClick={() => setOpen(!open)}>
          <AssignmentRoundedIcon />
          <ListItemContent>
            <Typography level="title-sm">Orders</Typography>
          </ListItemContent>
          <KeyboardArrowDownIcon
            sx={[open ? { transform: 'rotate(180deg)' } : { transform: 'none' }]}
          />
        </ListItemButton>
      )}
    >
      <List sx={{ gap: 0.5 }}>
        <ListItem sx={{ mt: 0.5, mb: 0.5 }}> {/* Espacio intermedio */}
          <ListItemButton>All tasks</ListItemButton>
        </ListItem>
        <ListItem sx={{ mb: 0.5 }}>
          <ListItemButton>Backlog</ListItemButton>
        </ListItem>
        <ListItem sx={{ mb: 0.5 }}>
          <ListItemButton>In progress</ListItemButton>
        </ListItem>
        <ListItem sx={{ mb: 0.5 }}>
          <ListItemButton>Done</ListItemButton>
        </ListItem>
      </List>
    </Toggler>
  </ListItem>

  <ListItem sx={{ mb: 1 }}>
    <ListItemButton
      role="menuitem"
      component="a"
      href="/joy-ui/getting-started/templates/messages/"
    >
      <QuestionAnswerRoundedIcon />
      <ListItemContent>
        <Typography level="title-sm">Suppliers</Typography>
      </ListItemContent>
    </ListItemButton>
  </ListItem>

  <ListItem nested>
    <Toggler
      renderToggle={({ open, setOpen }) => (
        <ListItemButton onClick={() => setOpen(!open)}>
          <GroupRoundedIcon />
          <ListItemContent>
            <Typography level="title-sm">Users</Typography>
          </ListItemContent>
          <KeyboardArrowDownIcon
            sx={[open ? { transform: 'rotate(180deg)' } : { transform: 'none' }]}
          />
        </ListItemButton>
      )}
    >
      <List sx={{ gap: 0.5 }}>
        <ListItem sx={{ mt: 0.5, mb: 0.5 }}>
          <ListItemButton
            role="menuitem"
            component="a"
            href="/joy-ui/getting-started/templates/profile-dashboard/"
          >
            My profile
          </ListItemButton>
        </ListItem>
        <ListItem sx={{ mb: 0.5 }}>
          <ListItemButton>Create a new user</ListItemButton>
        </ListItem>
        <ListItem sx={{ mb: 0.5 }}>
          <ListItemButton>Roles & permission</ListItemButton>
        </ListItem>
      </List>
    </Toggler>
  </ListItem>
  <ListItem sx={{ mb: 0 }}>
    <ListItemButton>
      <ShoppingCartRoundedIcon />
      <ListItemContent>
        <Typography level="title-sm">Cash</Typography>
      </ListItemContent>
    </ListItemButton>
  </ListItem>
  <ListItem sx={{ mb: 0 }}> {/* Margen inferior para consistencia */}
    <ListItemButton>
      <SettingsRoundedIcon />
      Settings
    </ListItemButton>
  </ListItem>
</List>


        
      </Box>
      <Divider />
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
        <Avatar
          variant="outlined"
          size="sm"
          src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=286"
        />
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography level="title-sm">Siriwat K.</Typography>
          <Typography level="body-xs">siriwatk@test.com</Typography>
        </Box>
        <IconButton size="sm" variant="plain" color="neutral">
          <LogoutRoundedIcon />
        </IconButton>
      </Box>
    </Sheet>
  );
}
