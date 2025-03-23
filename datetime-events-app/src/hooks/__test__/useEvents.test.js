import { renderHook, act } from '@testing-library/react';
import { useEvents } from '../useEvents';
import { useEventContext, EVENT_ACTIONS } from '../../context/EventContext';
import { eventService } from '../../services/eventService';

jest.mock('../../context/EventContext', () => ({
  useEventContext: jest.fn(),
  EVENT_ACTIONS: {
    LOAD_EVENTS: 'LOAD_EVENTS',
    ADD_EVENT: 'ADD_EVENT',
    UPDATE_EVENT: 'UPDATE_EVENT',
    DELETE_EVENT: 'DELETE_EVENT',
    SET_FILTER: 'SET_FILTER',
    SET_SELECTED_EVENT: 'SET_SELECTED_EVENT',
  },
}));

jest.mock('../../services/eventService', () => ({
  eventService: {
    getEvents: jest.fn(),
    addEvent: jest.fn(),
    updateEvent: jest.fn(),
    deleteEvent: jest.fn(),
    initWithDemoData: jest.fn(),
  },
}));

describe('useEvents hook', () => {
  const mockEvents = [
    { id: '1', title: 'Test Event 1', date: new Date().toISOString(), importance: 'normale' },
    { id: '2', title: 'Test Event 2', date: new Date().toISOString(), importance: 'haute' },
  ];

  const mockState = {
    events: mockEvents,
    filteredEvents: mockEvents,
    selectedEvent: null,
    filter: { startDate: null, endDate: null, importance: 'all' },
    loading: false,
    error: null,
  };

  const mockDispatch = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    useEventContext.mockReturnValue({
      state: mockState,
      dispatch: mockDispatch,
    });
  });

  it("récupère et retourne les valeurs correctes de l'état", () => {
    const { result } = renderHook(() => useEvents());

    expect(result.current.events).toEqual(mockEvents);
    expect(result.current.filteredEvents).toEqual(mockEvents);
    expect(result.current.selectedEvent).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

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

      expect(result.current.error).toBeTruthy();
      expect(result.current.error).toContain('Failed to fetch events');
    });
  });

  describe('createEvent', () => {
    it('crée un événement et dispatche les données', async () => {
      const newEvent = { title: 'New Event', date: new Date(), importance: 'critique' };
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
      const newEvent = { title: 'New Event', date: new Date(), importance: 'critique' };
      const error = new Error('Failed to create event');

      eventService.addEvent.mockRejectedValue(error);

      const { result } = renderHook(() => useEvents());

      let thrownError;
      await act(async () => {
        try {
          await result.current.createEvent(newEvent);
        } catch (e) {
          thrownError = e;
        }
      });

      expect(thrownError).toBe(error);
      expect(result.current.error).toBeTruthy();
      expect(result.current.error).toContain('Failed to create event');
    });
  });

  describe('updateEvent', () => {
    it('met à jour un événement et dispatche les données', async () => {
      const eventId = '1';
      const eventData = { title: 'Updated Event', date: new Date(), importance: 'haute' };
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
      const eventData = { title: 'Updated Event' };
      const error = new Error('Failed to update event');

      eventService.updateEvent.mockRejectedValue(error);

      const { result } = renderHook(() => useEvents());

      let thrownError;
      await act(async () => {
        try {
          await result.current.updateEvent(eventId, eventData);
        } catch (e) {
          thrownError = e;
        }
      });

      expect(thrownError).toBe(error);
      expect(result.current.error).toBeTruthy();
      expect(result.current.error).toContain('Failed to update event');
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

      let thrownError;
      await act(async () => {
        try {
          await result.current.deleteEvent(eventId);
        } catch (e) {
          thrownError = e;
        }
      });

      expect(thrownError).toBe(error);
      expect(result.current.error).toBeTruthy();
      expect(result.current.error).toContain('Failed to delete event');
    });
  });

  describe('selectEvent', () => {
    it("dispatche l'événement sélectionné", () => {
      const selectedEvent = mockEvents[0];

      const { result } = renderHook(() => useEvents());

      act(() => {
        result.current.selectEvent(selectedEvent);
      });

      expect(mockDispatch).toHaveBeenCalledWith({
        type: EVENT_ACTIONS.SET_SELECTED_EVENT,
        payload: selectedEvent,
      });
    });
  });

  describe('updateFilters', () => {
    it('dispatche les filtres mis à jour', () => {
      const newFilters = {
        startDate: new Date(),
        endDate: new Date(),
        importance: 'haute',
      };

      const { result } = renderHook(() => useEvents());

      act(() => {
        result.current.updateFilters(newFilters);
      });

      expect(mockDispatch).toHaveBeenCalledWith({
        type: EVENT_ACTIONS.SET_FILTER,
        payload: newFilters,
      });
    });
  });

  describe('initializeDemoData', () => {
    it('initialise les données de démo et dispatche les événements', async () => {
      const demoEvents = [
        {
          id: 'demo1',
          title: 'Demo Event 1',
          date: new Date().toISOString(),
          importance: 'normale',
        },
        { id: 'demo2', title: 'Demo Event 2', date: new Date().toISOString(), importance: 'haute' },
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

      let thrownError;
      await act(async () => {
        try {
          await result.current.initializeDemoData();
        } catch (e) {
          thrownError = e;
        }
      });

      expect(thrownError).toBe(error);
      expect(result.current.error).toBeTruthy();
      expect(result.current.error).toContain('Failed to initialize demo data');
    });
  });
});
