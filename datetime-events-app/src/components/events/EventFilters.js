import React, { useState } from "react";
import {
  Box,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import {
  ExpandMore as ExpandMoreIcon,
  FilterList as FilterIcon,
} from "@mui/icons-material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { useEvents } from "../../hooks/useEvents";

const EventFilters = () => {
  const { filters, updateFilters } = useEvents();

  const [localFilters, setLocalFilters] = useState({
    startDate: filters.startDate,
    endDate: filters.endDate,
    importance: filters.importance || "all",
  });

  // Gérer les changements de filtre
  const handleFilterChange = (name, value) => {
    setLocalFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Appliquer les filtres
  const handleApplyFilters = () => {
    updateFilters(localFilters);
  };

  // Réinitialiser les filtres
  const handleResetFilters = () => {
    const resetFilters = {
      startDate: null,
      endDate: null,
      importance: "all",
    };

    setLocalFilters(resetFilters);
    updateFilters(resetFilters);
  };

  return (
    <Accordion defaultExpanded>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls="filter-panel-content"
        id="filter-panel-header"
      >
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <FilterIcon sx={{ mr: 1 }} />
          <Typography>Filtres</Typography>
        </Box>
      </AccordionSummary>

      <AccordionDetails>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={3}>
            <DatePicker
              label="Date de début"
              value={localFilters.startDate}
              onChange={(newValue) => handleFilterChange("startDate", newValue)}
              renderInput={(params) => (
                <FormControl fullWidth>{params}</FormControl>
              )}
              clearable
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <DatePicker
              label="Date de fin"
              value={localFilters.endDate}
              onChange={(newValue) => handleFilterChange("endDate", newValue)}
              renderInput={(params) => (
                <FormControl fullWidth>{params}</FormControl>
              )}
              clearable
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel id="importance-filter-label">Importance</InputLabel>
              <Select
                labelId="importance-filter-label"
                value={localFilters.importance}
                label="Importance"
                onChange={(e) =>
                  handleFilterChange("importance", e.target.value)
                }
              >
                <MenuItem value="all">Toutes</MenuItem>
                <MenuItem value="basse">Basse</MenuItem>
                <MenuItem value="normale">Normale</MenuItem>
                <MenuItem value="haute">Haute</MenuItem>
                <MenuItem value="critique">Critique</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ display: "flex", gap: 1 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleApplyFilters}
              >
                Appliquer
              </Button>
              <Button variant="outlined" onClick={handleResetFilters}>
                Réinitialiser
              </Button>
            </Box>
          </Grid>
        </Grid>
      </AccordionDetails>
    </Accordion>
  );
};

export default EventFilters;
