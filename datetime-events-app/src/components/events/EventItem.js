import React from "react";
import {
  ListItem,
  ListItemText,
  IconButton,
  Typography,
  Chip,
  Stack,
  Divider,
  Paper,
} from "@mui/material";
import { Edit as EditIcon, Delete as DeleteIcon } from "@mui/icons-material";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const EventItem = ({ event, onEdit, onDelete, importanceColor }) => {
  return (
    <Paper sx={{ mb: 2, overflow: "hidden" }}>
      <ListItem
        secondaryAction={
          <Stack direction="row" spacing={1}>
            <IconButton edge="end" aria-label="edit" onClick={onEdit}>
              <EditIcon />
            </IconButton>
            <IconButton edge="end" aria-label="delete" onClick={onDelete}>
              <DeleteIcon />
            </IconButton>
          </Stack>
        }
        sx={{
          borderLeft: 4,
          borderColor: `${importanceColor}.main`,
          transition: "all 0.2s",
          "&:hover": {
            backgroundColor: "rgba(0, 0, 0, 0.04)",
          },
        }}
      >
        <ListItemText
          primary={
            <Typography variant="h6" component="div">
              {event.title}
            </Typography>
          }
          secondary={
            <Stack spacing={1} mt={1}>
              <Typography variant="body2" color="text.secondary">
                {format(new Date(event.date), "PPPp", { locale: fr })}
              </Typography>

              <Chip
                label={event.importance}
                size="small"
                color={importanceColor}
                sx={{ width: "fit-content" }}
              />

              {event.description && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    mt: 1,
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {event.description}
                </Typography>
              )}
            </Stack>
          }
        />
      </ListItem>
    </Paper>
  );
};

export default EventItem;
