import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  IconButton,
  Button,
  Stack,
  CircularProgress,
  Alert,
} from "@mui/material";
import { Add as AddIcon, Refresh as RefreshIcon } from "@mui/icons-material";
import { useEvents } from "../../hooks/useEvents";
import EventItem from "./EventItem";
import ConfirmDialog from "../ui/ConfirmDialog";

const EventList = ({ onAdd, onEdit }) => {
  const {
    filteredEvents,
    selectEvent,
    deleteEvent,
    fetchEvents,
    loading,
    error,
    initializeDemoData,
  } = useEvents();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);
  const [deleteError, setDeleteError] = useState(null);

  // Chargement initial des événements
  useEffect(() => {
    fetchEvents();
  }, []);

  // Gestion de l'édition d'un événement
  const handleEdit = (event) => {
    selectEvent(event);
    onEdit();
  };

  // Ouvrir le dialogue de confirmation pour supprimer
  const handleDeleteClick = (event) => {
    setEventToDelete(event);
    setDeleteDialogOpen(true);
  };

  // Confirmer et supprimer l'événement
  const handleDeleteConfirm = async () => {
    if (!eventToDelete) return;

    try {
      await deleteEvent(eventToDelete.id);
      setDeleteDialogOpen(false);
      setEventToDelete(null);
      setDeleteError(null);
    } catch (err) {
      setDeleteError(err.message || "Erreur lors de la suppression");
    }
  };

  // Annuler la suppression
  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setEventToDelete(null);
    setDeleteError(null);
  };

  // Ajouter des données de démo
  const handleAddDemoData = async () => {
    try {
      await initializeDemoData();
    } catch (err) {
      console.error("Error adding demo data:", err);
    }
  };

  // Déterminer la couleur du chip selon l'importance
  const getImportanceColor = (importance) => {
    switch (importance) {
      case "basse":
        return "info";
      case "normale":
        return "success";
      case "haute":
        return "warning";
      case "critique":
        return "error";
      default:
        return "default";
    }
  };

  // Rendu du contenu principal
  const renderContent = () => {
    if (loading) {
      return (
        <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
          <CircularProgress />
        </Box>
      );
    }

    if (error) {
      return (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      );
    }

    if (filteredEvents.length === 0) {
      return (
        <Paper sx={{ p: 3, textAlign: "center" }}>
          <Typography variant="body1" color="text.secondary" gutterBottom>
            Aucun événement trouvé.
          </Typography>
          <Stack
            direction="row"
            spacing={2}
            justifyContent="center"
            sx={{ mt: 2 }}
          >
            <Button variant="contained" startIcon={<AddIcon />} onClick={onAdd}>
              Créer un événement
            </Button>
            <Button variant="outlined" onClick={handleAddDemoData}>
              Ajouter des données de démo
            </Button>
          </Stack>
        </Paper>
      );
    }

    return filteredEvents.map((event) => (
      <EventItem
        key={event.id}
        event={event}
        onEdit={() => handleEdit(event)}
        onDelete={() => handleDeleteClick(event)}
        importanceColor={getImportanceColor(event.importance)}
      />
    ));
  };

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography variant="h6">
            {filteredEvents.length} événement(s) trouvé(s)
          </Typography>
          <IconButton onClick={fetchEvents} disabled={loading}>
            <RefreshIcon />
          </IconButton>
        </Stack>
      </Box>

      {renderContent()}

      <ConfirmDialog
        open={deleteDialogOpen}
        title="Confirmer la suppression"
        content="Êtes-vous sûr de vouloir supprimer cet événement ? Cette action est irréversible."
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        error={deleteError}
      />
    </Box>
  );
};

export default EventList;
