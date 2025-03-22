import React, { createContext, useReducer, useContext, useEffect } from "react";
import { eventService } from "../services/eventService";

// Définition du contexte
export const EventContext = createContext();

// Types d'actions
export const EVENT_ACTIONS = {
  LOAD_EVENTS: "LOAD_EVENTS",
  ADD_EVENT: "ADD_EVENT",
  UPDATE_EVENT: "UPDATE_EVENT",
  DELETE_EVENT: "DELETE_EVENT",
  SET_FILTER: "SET_FILTER",
  SET_SELECTED_EVENT: "SET_SELECTED_EVENT",
};

// État initial
const initialState = {
  events: [],
  filteredEvents: [],
  filter: {
    startDate: null,
    endDate: null,
    importance: "all",
  },
  selectedEvent: null,
  loading: true,
  error: null,
};

// Fonction de réduction
const eventReducer = (state, action) => {
  switch (action.type) {
    case EVENT_ACTIONS.LOAD_EVENTS:
      // Assurez-vous que action.payload est un tableau
      const eventsPayload = Array.isArray(action.payload) ? action.payload : [];
      return {
        ...state,
        events: eventsPayload,
        filteredEvents: applyFilters(eventsPayload, state.filter),
        loading: false,
      };

    case EVENT_ACTIONS.ADD_EVENT:
      // Assurez-vous que state.events est un tableau avant d'utiliser spread
      const currentEvents = Array.isArray(state.events) ? state.events : [];
      const addedEvents = [...currentEvents, action.payload];
      return {
        ...state,
        events: addedEvents,
        filteredEvents: applyFilters(addedEvents, state.filter),
      };

    case EVENT_ACTIONS.UPDATE_EVENT:
      const updatedEvents = state.events.map((event) =>
        event.id === action.payload.id ? action.payload : event
      );
      return {
        ...state,
        events: updatedEvents,
        filteredEvents: applyFilters(updatedEvents, state.filter),
        selectedEvent: null,
      };

    case EVENT_ACTIONS.DELETE_EVENT:
      const eventsAfterDelete = state.events.filter(
        (event) => event.id !== action.payload
      );
      return {
        ...state,
        events: eventsAfterDelete,
        filteredEvents: applyFilters(eventsAfterDelete, state.filter),
        selectedEvent: null,
      };

    case EVENT_ACTIONS.SET_FILTER:
      return {
        ...state,
        filter: action.payload,
        filteredEvents: applyFilters(state.events, action.payload),
      };

    case EVENT_ACTIONS.SET_SELECTED_EVENT:
      return {
        ...state,
        selectedEvent: action.payload,
      };

    default:
      return state;
  }
};

// Fonction pour appliquer les filtres
const applyFilters = (events, filter) => {
  console.log("Events avant filtrage:", events);
  // Vérifier si events est un tableau
  if (!Array.isArray(events)) {
    return [];
  }
  return events.filter((event) => {
    const eventDate = new Date(event.date);

    // Filtre par plage de dates
    if (filter.startDate && eventDate < filter.startDate) return false;
    if (filter.endDate && eventDate > filter.endDate) return false;

    // Filtre par importance
    if (filter.importance !== "all" && event.importance !== filter.importance)
      return false;

    return true;
  });
};

// Provider qui encapsule l'application
export const EventProvider = ({ children }) => {
  const [state, dispatch] = useReducer(eventReducer, initialState);

  // Chargement initial des événements
  useEffect(() => {
    const loadEvents = async () => {
      try {
        const events = await eventService.getEvents();
        dispatch({
          type: EVENT_ACTIONS.LOAD_EVENTS,
          payload: events,
        });
      } catch (error) {
        console.error("Error loading events:", error);
      }
    };

    loadEvents();
  }, []);

  return (
    <EventContext.Provider value={{ state, dispatch }}>
      {children}
    </EventContext.Provider>
  );
};

// Hook personnalisé pour utiliser le contexte
export const useEventContext = () => {
  const context = useContext(EventContext);
  if (!context) {
    throw new Error("useEventContext must be used within an EventProvider");
  }
  return context;
};
