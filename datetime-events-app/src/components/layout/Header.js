import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Event as EventIcon } from '@mui/icons-material';

const Header = () => {
  return (
    <AppBar position="static">
      <Toolbar>
        <EventIcon sx={{ mr: 2 }} />
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Gestionnaire d&apos;Événements
        </Typography>
        <Box>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Test Technique Fetni Mohamed
          </Typography>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
