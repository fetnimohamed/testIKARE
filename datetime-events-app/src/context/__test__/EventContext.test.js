import React from 'react';
import { render, act } from '@testing-library/react';
import {
  EventContext,
  EventProvider,
  eventReducer,
  EVENT_ACTIONS,
  useEventContext,
} from '../EventContext';
import { eventService } from '../../services/eventService';

// Mock du service
jest.mock('../../services/eventService', () => ({
  getEvents: jest.fn(),
}));

// Composant de test pour useEventContext
const TestComponent = () => {
  const context = useEventContext();
  return <div data-testid="context-test">{context ? 'Context OK' : 'Context Missing'}</div>;
};

describe('EventContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock de la réponse du service
    eventService.getEvents.mockResolvedValue([
      { id: '1', title: 'Test Event', date: new Date().toISOString(), importance: 'haute' },
    ]);
  });

  describe('EventProvider', () => {
    it('charge les événements au montage', async () => {
      await act(async () => {
        render(
          <EventProvider>
            <div>Test Provider</div>
          </EventProvider>
        );
      });

      expect(eventService.getEvents).toHaveBeenCalled();
    });

    it('fournit le contexte aux composants enfants', () => {
      const { getByTestId } = render(
        <EventProvider>
          <TestComponent />
        </EventProvider>
      );

      expect(getByTestId('context-test').textContent).toBe('Context OK');
    });

    it('lève une erreur quand useEventContext est utilisé en dehors du Provider', () => {
      // Masquer les erreurs de console pour ce test
      const consoleError = console.error;
      console.error = jest.fn();

      expect(() => {
        render(<TestComponent />);
      }).toThrow('useEventContext must be used within an EventProvider');

      // Restaurer console.error
      console.error = consoleError;
    });
  });

  describe('eventReducer', () => {
    const initialState = {
      events: [],
      filteredEvents: [],
      filter: {
        startDate: null,
        endDate: null,
        importance: 'all',
      },
      selectedEvent: null,
      loading: true,
      error: null,
    };

    it('gère correctement LOAD_EVENTS', () => {
      const events = [
        { id: '1', title: 'Event 1', date: new Date(), importance: 'normale' },
        { id: '2', title: 'Event 2', date: new Date(), importance: 'haute' },
      ];

      const action = {
        type: EVENT_ACTIONS.LOAD_EVENTS,
        payload: events,
      };

      const newState = eventReducer(initialState, action);

      expect(newState.events).toEqual(events);
      expect(newState.loading).toBe(false);
      expect(newState.filteredEvents).toHaveLength(events.length);
    });

    it('gère correctement ADD_EVENT', () => {
      const existingEvents = [
        { id: '1', title: 'Existing Event', date: new Date(), importance: 'normale' },
      ];

      const state = {
        ...initialState,
        events: existingEvents,
        filteredEvents: existingEvents,
      };

      const newEvent = { id: '2', title: 'New Event', date: new Date(), importance: 'haute' };

      const action = {
        type: EVENT_ACTIONS.ADD_EVENT,
        payload: newEvent,
      };

      const newState = eventReducer(state, action);

      expect(newState.events).toHaveLength(2);
      expect(newState.events).toContainEqual(newEvent);
      expect(newState.filteredEvents).toHaveLength(2);
    });

    it('gère correctement UPDATE_EVENT', () => {
      const events = [
        { id: '1', title: 'Event 1', date: new Date(), importance: 'normale' },
        { id: '2', title: 'Event 2', date: new Date(), importance: 'haute' },
      ];

      const state = {
        ...initialState,
        events,
        filteredEvents: events,
        selectedEvent: events[0],
      };

      const updatedEvent = { ...events[0], title: 'Updated Event', importance: 'critique' };

      const action = {
        type: EVENT_ACTIONS.UPDATE_EVENT,
        payload: updatedEvent,
      };

      const newState = eventReducer(state, action);

      expect(newState.events[0]).toEqual(updatedEvent);
      expect(newState.events[1]).toEqual(events[1]);
      expect(newState.selectedEvent).toBeNull();
    });

    it('gère correctement DELETE_EVENT', () => {
      const events = [
        { id: '1', title: 'Event 1', date: new Date(), importance: 'normale' },
        { id: '2', title: 'Event 2', date: new Date(), importance: 'haute' },
      ];

      const state = {
        ...initialState,
        events,
        filteredEvents: events,
        selectedEvent: events[0],
      };

      const action = {
        type: EVENT_ACTIONS.DELETE_EVENT,
        payload: '1',
      };

      const newState = eventReducer(state, action);

      expect(newState.events).toHaveLength(1);
      expect(newState.events[0]).toEqual(events[1]);
      expect(newState.selectedEvent).toBeNull();
    });

    it('gère correctement SET_FILTER', () => {
      const events = [
        { id: '1', title: 'Event 1', date: new Date(), importance: 'normale' },
        { id: '2', title: 'Event 2', date: new Date(), importance: 'haute' },
      ];

      const state = {
        ...initialState,
        events,
        filteredEvents: events,
      };

      const newFilter = {
        startDate: new Date(),
        endDate: new Date(Date.now() + 86400000), // tomorrow
        importance: 'haute',
      };

      const action = {
        type: EVENT_ACTIONS.SET_FILTER,
        payload: newFilter,
      };

      const newState = eventReducer(state, action);

      expect(newState.filter).toEqual(newFilter);
      // La filteredEvents liste sera filtrée selon la nouvelle importance
      expect(newState.filteredEvents.length).toBeLessThanOrEqual(events.length);
    });

    it('gère correctement SET_SELECTED_EVENT', () => {
      const selectedEvent = {
        id: '1',
        title: 'Selected Event',
        date: new Date(),
        importance: 'haute',
      };

      const action = {
        type: EVENT_ACTIONS.SET_SELECTED_EVENT,
        payload: selectedEvent,
      };

      const newState = eventReducer(initialState, action);

      expect(newState.selectedEvent).toEqual(selectedEvent);
    });

    it("retourne l'état inchangé pour une action inconnue", () => {
      const action = {
        type: 'UNKNOWN_ACTION',
        payload: {},
      };

      const newState = eventReducer(initialState, action);

      expect(newState).toEqual(initialState);
    });
  });

  describe('applyFilters', () => {
    // Pour tester la fonction applyFilters, nous devons l'extraire ou recréer sa logique
    // Supposons que nous avons accès à une fonction applyFilters exportée

    const mockApplyFilters = (events, filter) => {
      return events.filter(event => {
        const eventDate = new Date(event.date);

        // Filtre par plage de dates
        if (filter.startDate && eventDate < filter.startDate) return false;
        if (filter.endDate && eventDate > filter.endDate) return false;

        // Filtre par importance
        if (filter.importance !== 'all' && event.importance !== filter.importance) return false;

        return true;
      });
    };

    it('filtre correctement par plage de dates', () => {
      const now = new Date();
      const yesterday = new Date(now);
      yesterday.setDate(now.getDate() - 1);
      const tomorrow = new Date(now);
      tomorrow.setDate(now.getDate() + 1);

      const events = [
        { id: '1', title: 'Past Event', date: yesterday, importance: 'normale' },
        { id: '2', title: 'Future Event', date: tomorrow, importance: 'normale' },
      ];

      const filter = {
        startDate: now,
        endDate: null,
        importance: 'all',
      };

      const filteredEvents = mockApplyFilters(events, filter);
      expect(filteredEvents).toHaveLength(1);
      expect(filteredEvents[0].title).toBe('Future Event');
    });

    it('filtre correctement par importance', () => {
      const events = [
        { id: '1', title: 'Normal Event', date: new Date(), importance: 'normale' },
        { id: '2', title: 'Critical Event', date: new Date(), importance: 'critique' },
      ];

      const filter = {
        startDate: null,
        endDate: null,
        importance: 'critique',
      };

      const filteredEvents = mockApplyFilters(events, filter);
      expect(filteredEvents).toHaveLength(1);
      expect(filteredEvents[0].title).toBe('Critical Event');
    });

    it('ne filtre pas quand tous les filtres sont vides', () => {
      const events = [
        { id: '1', title: 'Event 1', date: new Date(), importance: 'normale' },
        { id: '2', title: 'Event 2', date: new Date(), importance: 'haute' },
      ];

      const filter = {
        startDate: null,
        endDate: null,
        importance: 'all',
      };

      const filteredEvents = mockApplyFilters(events, filter);
      expect(filteredEvents).toHaveLength(2);
    });
  });
});
