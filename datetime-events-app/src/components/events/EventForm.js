import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Alert,
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { useEvents } from '../../hooks/useEvents';

const EventForm = ({ open, onClose }) => {
  const { selectedEvent, createEvent, updateEvent, loading, error } = useEvents();

  const [formData, setFormData] = useState({
    title: '',
    date: new Date(),
    description: '',
    importance: 'normale',
  });

  const [formErrors, setFormErrors] = useState({});
  const [submitError, setSubmitError] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    if (selectedEvent) {
      setFormData({
        title: selectedEvent.title,
        date: new Date(selectedEvent.date),
        description: selectedEvent.description || '',
        importance: selectedEvent.importance || 'normale',
      });
      setIsEditMode(true);
    } else {
      setFormData({
        title: '',
        date: new Date(),
        description: '',
        importance: 'normale',
      });
      setIsEditMode(false);
    }
    setFormErrors({});
    setSubmitError(null);
  }, [selectedEvent, open]);

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: null,
      }));
    }
  };

  const handleDateChange = newDate => {
    setFormData(prev => ({
      ...prev,
      date: newDate,
    }));

    if (formErrors.date) {
      setFormErrors(prev => ({
        ...prev,
        date: null,
      }));
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.title.trim()) {
      errors.title = 'Le titre est requis';
    }

    if (!formData.date) {
      errors.date = 'La date est requise';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setSubmitError(null);

    if (!validateForm()) {
      return;
    }

    try {
      if (isEditMode && selectedEvent) {
        await updateEvent(selectedEvent.id, formData);
      } else {
        await createEvent(formData);
      }
      onClose();
    } catch (err) {
      setSubmitError(err.message || "Une erreur est survenue lors de l'enregistrement");
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEditMode ? "Modifier l'événement" : 'Créer un nouvel événement'}</DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            {submitError && <Alert severity="error">{submitError}</Alert>}

            <TextField
              name="title"
              label="Titre de l'événement"
              value={formData.title}
              onChange={handleChange}
              fullWidth
              required
              error={!!formErrors.title}
              helperText={formErrors.title}
              disabled={loading}
            />

            <DateTimePicker
              label="Date et heure"
              value={formData.date}
              onChange={handleDateChange}
              renderInput={params => (
                <TextField
                  {...params}
                  fullWidth
                  required
                  error={!!formErrors.date}
                  helperText={formErrors.date}
                />
              )}
              disabled={loading}
            />

            <FormControl fullWidth>
              <InputLabel id="importance-label">Importance</InputLabel>
              <Select
                labelId="importance-label"
                name="importance"
                value={formData.importance}
                onChange={handleChange}
                label="Importance"
                disabled={loading}
              >
                <MenuItem value="basse">Basse</MenuItem>
                <MenuItem value="normale">Normale</MenuItem>
                <MenuItem value="haute">Haute</MenuItem>
                <MenuItem value="critique">Critique</MenuItem>
              </Select>
            </FormControl>

            <TextField
              name="description"
              label="Description"
              value={formData.description}
              onChange={handleChange}
              fullWidth
              multiline
              rows={4}
              disabled={loading}
            />
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose} disabled={loading}>
            Annuler
          </Button>
          <Button type="submit" variant="contained" color="primary" disabled={loading}>
            {loading ? 'Enregistrement...' : isEditMode ? 'Mettre à jour' : 'Créer'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default EventForm;
