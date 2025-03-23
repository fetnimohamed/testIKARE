import { renderHook, act } from '@testing-library/react';
import { useEvents } from '../../hooks/useEvents';
import { useEventContext, EVENT_ACTIONS } from '../../context/EventContext';
import { eventService } from '../../services/eventService';

// Ajouter un mock pour eventService
jest.mock('../../services/eventService', () => ({
  eventService: {
    getEvents: jest.fn(),
    addEvent: jest.fn(),
    updateEvent: jest.fn(),
    deleteEvent: jest.fn(),
    initWithDemoData: jest.fn(),
  },
}));

// Mock du contexte des événements
jest.mock('../../context/EventContext', () => ({
  useEventContext: jest.fn(),
  EVENT_ACTIONS: {
    LOAD_EVENTS: 'LOAD_EVENTS',
    ADD_EVENT: 'ADD_EVENT',
    UPDATE_EVENT: 'UPDATE_EVENT',
    DELETE_EVENT: 'DELETE_EVENT',
    SET_FILTER: 'SET_FILTER',
    SET_SELECTED_EVENT: 'SET_SELECTED_EVENT',
    SET_ERROR: 'SET_ERROR',
  },
}));

describe('useEvents hook', () => {
  const mockDispatch = jest.fn();
  const mockState = {
    events: [],
    filteredEvents: [],
    filter: { startDate: null, endDate: null, importance: 'all' },
    selectedEvent: null,
    loading: false,
    error: null,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    useEventContext.mockReturnValue({
      dispatch: mockDispatch,
      state: mockState,
    });
  });

  const mockEvents = [
    { id: '1', title: 'Test Event 1', date: '2023-01-15T10:00:00Z', importance: 'haute' },
    { id: '2', title: 'Test Event 2', date: '2023-02-20T14:30:00Z', importance: 'normale' },
  ];

  describe('fetchEvents', () => {
    it('récupère les événements et dispatche les données', async () => {
      eventService.getEvents.mockResolvedValue(mockEvents);

      const { result } = renderHook(() => useEvents());

      await act(async () => {
        await result.current.fetchEvents();
      });

      expect(eventService.getEvents).toHaveBeenCalled();
      expect(mockDispatch).toHaveBeenCalledWith({
        type: EVENT_ACTIONS.LOAD_EVENTS,
        payload: mockEvents,
      });
    });

    it('gère les erreurs lors de la récupération des événements', async () => {
      const error = new Error('Failed to fetch events');
      eventService.getEvents.mockRejectedValue(error);

      const { result } = renderHook(() => useEvents());

      await act(async () => {
        await result.current.fetchEvents();
      });

      expect(eventService.getEvents).toHaveBeenCalled();
      expect(mockDispatch).toHaveBeenCalledWith({
        type: EVENT_ACTIONS.SET_ERROR,
        payload: expect.any(String),
      });
    });
  });

  describe('createEvent', () => {
    it('crée un événement et dispatche les données', async () => {
      const newEvent = {
        title: 'New Event',
        date: new Date('2023-03-10'),
        importance: 'critique',
      };
      const createdEvent = { ...newEvent, id: '3' };

      eventService.addEvent.mockResolvedValue(createdEvent);

      const { result } = renderHook(() => useEvents());

      await act(async () => {
        await result.current.createEvent(newEvent);
      });

      expect(eventService.addEvent).toHaveBeenCalledWith(newEvent);
      expect(mockDispatch).toHaveBeenCalledWith({
        type: EVENT_ACTIONS.ADD_EVENT,
        payload: createdEvent,
      });
    });

    it("gère les erreurs lors de la création d'un événement", async () => {
      const newEvent = {
        title: 'New Event',
        date: new Date(),
        importance: 'normale',
      };
      const error = new Error('Failed to create event');

      eventService.addEvent.mockRejectedValue(error);

      const { result } = renderHook(() => useEvents());

      await act(async () => {
        await result.current.createEvent(newEvent);
      });

      expect(eventService.addEvent).toHaveBeenCalledWith(newEvent);
      expect(mockDispatch).toHaveBeenCalledWith({
        type: EVENT_ACTIONS.SET_ERROR,
        payload: expect.any(String),
      });
    });
  });

  describe('updateEvent', () => {
    it('met à jour un événement et dispatche les données', async () => {
      const eventId = '1';
      const eventData = {
        title: 'Updated Event',
        date: new Date('2023-01-15'),
        importance: 'critique',
      };
      const updatedEvent = { ...eventData, id: eventId };

      eventService.updateEvent.mockResolvedValue(updatedEvent);

      const { result } = renderHook(() => useEvents());

      await act(async () => {
        await result.current.updateEvent(eventId, eventData);
      });

      expect(eventService.updateEvent).toHaveBeenCalledWith(eventId, eventData);
      expect(mockDispatch).toHaveBeenCalledWith({
        type: EVENT_ACTIONS.UPDATE_EVENT,
        payload: updatedEvent,
      });
    });

    it("gère les erreurs lors de la mise à jour d'un événement", async () => {
      const eventId = '1';
      const eventData = {
        title: 'Updated Event',
        date: new Date(),
        importance: 'critique',
      };
      const error = new Error('Failed to update event');

      eventService.updateEvent.mockRejectedValue(error);

      const { result } = renderHook(() => useEvents());

      await act(async () => {
        await result.current.updateEvent(eventId, eventData);
      });

      expect(eventService.updateEvent).toHaveBeenCalledWith(eventId, eventData);
      expect(mockDispatch).toHaveBeenCalledWith({
        type: EVENT_ACTIONS.SET_ERROR,
        payload: expect.any(String),
      });
    });
  });

  describe('deleteEvent', () => {
    it("supprime un événement et dispatche l'id", async () => {
      const eventId = '1';

      eventService.deleteEvent.mockResolvedValue({ id: eventId });

      const { result } = renderHook(() => useEvents());

      await act(async () => {
        await result.current.deleteEvent(eventId);
      });

      expect(eventService.deleteEvent).toHaveBeenCalledWith(eventId);
      expect(mockDispatch).toHaveBeenCalledWith({
        type: EVENT_ACTIONS.DELETE_EVENT,
        payload: eventId,
      });
    });

    it("gère les erreurs lors de la suppression d'un événement", async () => {
      const eventId = '1';
      const error = new Error('Failed to delete event');

      eventService.deleteEvent.mockRejectedValue(error);

      const { result } = renderHook(() => useEvents());

      await act(async () => {
        await result.current.deleteEvent(eventId);
      });

      expect(eventService.deleteEvent).toHaveBeenCalledWith(eventId);
      expect(mockDispatch).toHaveBeenCalledWith({
        type: EVENT_ACTIONS.SET_ERROR,
        payload: expect.any(String),
      });
    });
  });

  describe('initializeDemoData', () => {
    it('initialise les données de démo et dispatche les événements', async () => {
      const demoEvents = [
        { id: '1', title: 'Demo Event 1', date: '2023-04-10T09:00:00Z', importance: 'haute' },
        { id: '2', title: 'Demo Event 2', date: '2023-04-15T14:00:00Z', importance: 'normale' },
        { id: '3', title: 'Demo Event 3', date: '2023-04-20T11:00:00Z', importance: 'critique' },
      ];

      eventService.initWithDemoData.mockResolvedValue(demoEvents);

      const { result } = renderHook(() => useEvents());

      await act(async () => {
        await result.current.initializeDemoData();
      });

      expect(eventService.initWithDemoData).toHaveBeenCalled();
      expect(mockDispatch).toHaveBeenCalledWith({
        type: EVENT_ACTIONS.LOAD_EVENTS,
        payload: demoEvents,
      });
    });

    it("gère les erreurs lors de l'initialisation des données de démo", async () => {
      const error = new Error('Failed to initialize demo data');

      eventService.initWithDemoData.mockRejectedValue(error);

      const { result } = renderHook(() => useEvents());

      await act(async () => {
        await result.current.initializeDemoData();
      });

      expect(eventService.initWithDemoData).toHaveBeenCalled();
      expect(mockDispatch).toHaveBeenCalledWith({
        type: EVENT_ACTIONS.SET_ERROR,
        payload: expect.any(String),
      });
    });
  });
});
