import { useState } from 'react';
import { useEventContext, EVENT_ACTIONS } from '../context/EventContext';
import { eventService } from '../services/eventService';

export const useEvents = () => {
  const { state, dispatch } = useEventContext();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchEvents = async () => {
    setLoading(true);
    setError(null);

    try {
      const events = await eventService.getEvents();
      console.log('Events:', events);
      dispatch({
        type: EVENT_ACTIONS.LOAD_EVENTS,
        payload: events,
      });
      return events;
    } catch (err) {
      setError(err.message || 'Erreur lors de la récupération des événements');
      return [];
    } finally {
      setLoading(false);
    }
  };

  const createEvent = async eventData => {
    setLoading(true);
    setError(null);

    try {
      const newEvent = await eventService.addEvent(eventData);
      dispatch({
        type: EVENT_ACTIONS.ADD_EVENT,
        payload: newEvent,
      });
      return newEvent;
    } catch (err) {
      setError(err.message || "Erreur lors de la création de l'événement");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateEvent = async (id, eventData) => {
    setLoading(true);
    setError(null);

    try {
      const updatedEvent = await eventService.updateEvent(id, eventData);
      dispatch({
        type: EVENT_ACTIONS.UPDATE_EVENT,
        payload: updatedEvent,
      });
      return updatedEvent;
    } catch (err) {
      setError(err.message || "Erreur lors de la mise à jour de l'événement");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteEvent = async id => {
    setLoading(true);
    setError(null);

    try {
      await eventService.deleteEvent(id);
      dispatch({
        type: EVENT_ACTIONS.DELETE_EVENT,
        payload: id,
      });
      return true;
    } catch (err) {
      setError(err.message || "Erreur lors de la suppression de l'événement");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const selectEvent = event => {
    dispatch({
      type: EVENT_ACTIONS.SET_SELECTED_EVENT,
      payload: event,
    });
  };

  const updateFilters = filters => {
    dispatch({
      type: EVENT_ACTIONS.SET_FILTER,
      payload: filters,
    });
  };

  const initializeDemoData = async () => {
    setLoading(true);
    setError(null);

    try {
      const demoEvents = await eventService.initWithDemoData();
      dispatch({
        type: EVENT_ACTIONS.LOAD_EVENTS,
        payload: demoEvents,
      });
      return demoEvents;
    } catch (err) {
      setError(err.message || "Erreur lors de l'initialisation des données de démo");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    events: state.events,
    filteredEvents: state.filteredEvents,
    selectedEvent: state.selectedEvent,
    filters: state.filter,
    loading: loading || state.loading,
    error,
    fetchEvents,
    createEvent,
    updateEvent,
    deleteEvent,
    selectEvent,
    updateFilters,
    initializeDemoData,
  };
};
