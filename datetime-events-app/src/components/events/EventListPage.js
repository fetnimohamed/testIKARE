import React, { useState } from 'react';
import { Container, Box, Typography, Button, Paper, Fab } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import EventList from './EventList';
import EventForm from './EventForm';
import EventFilters from './EventFilters';
import { useEvents } from '../../hooks/useEvents';

const EventListPage = () => {
  const [formOpen, setFormOpen] = useState(false);
  const { selectedEvent, loading } = useEvents();

  const handleAddClick = () => {
    setFormOpen(true);
  };

  const handleFormClose = () => {
    setFormOpen(false);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Événements
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddClick}>
          Nouvel événement
        </Button>
      </Box>

      <Paper sx={{ p: 2, mb: 3 }}>
        <EventFilters />
      </Paper>

      <EventList onAdd={handleAddClick} onEdit={() => setFormOpen(true)} />

      <EventForm open={formOpen} onClose={handleFormClose} />

      <Fab
        color="primary"
        aria-label="add"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={handleAddClick}
      >
        <AddIcon />
      </Fab>
    </Container>
  );
};

export default EventListPage;
