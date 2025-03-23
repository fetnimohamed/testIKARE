import { eventService } from '../eventService';
import config from '../../config';
import logger from '../../services/logger';

jest.mock('../../config', () => ({
  apiUrl: 'http://localhost:8000/api',
  useTestData: false,
  environment: 'test',
}));

jest.mock('../../services/logger', () => ({
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
}));

global.fetch = jest.fn();

function mockFetchResponse(data, status = 200) {
  return Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 200 ? 'OK' : 'Error',
    json: () => Promise.resolve(data),
  });
}

describe('eventService', () => {
  beforeEach(() => {
    fetch.mockClear();
    logger.error.mockClear();
    logger.info.mockClear();
    logger.debug.mockClear();
  });

  describe('getEvents', () => {
    it('récupère et normalise correctement les événements', async () => {
      const mockEvents = {
        items: [
          { id: '1', name: 'Test Event 1', at: '2023-01-15T10:00:00Z', importance: 'haute' },
          { id: '2', name: 'Test Event 2', at: '2023-02-20T14:30:00Z', importance: 'normale' },
        ],
      };
      global.fetch.mockImplementationOnce(() => mockFetchResponse(mockEvents));

      const result = await eventService.getEvents();

      expect(fetch).toHaveBeenCalledWith(`${config.apiUrl}/events/`);
      expect(result).toHaveLength(2);
      expect(result[0].title).toBe('Test Event 1');
      expect(result[1].importance).toBe('normale');
      expect(new Date(result[0].date).toISOString()).toBe(result[0].date);
    });

    it('gère correctement les erreurs', async () => {
      global.fetch.mockImplementationOnce(() => Promise.reject(new Error('Network error')));

      const result = await eventService.getEvents();

      expect(result).toEqual([]);
      expect(logger.error).toHaveBeenCalled();
    });

    it('utilise les données de test si useTestData est true', async () => {
      const originalUseTestData = config.useTestData;
      config.useTestData = true;

      const result = await eventService.getEvents();

      expect(fetch).not.toHaveBeenCalled();
      expect(logger.info).toHaveBeenCalledWith('Using test data for getEvents');
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);

      config.useTestData = originalUseTestData;
    });
  });

  describe('addEvent', () => {
    it('envoie correctement un nouvel événement', async () => {
      const mockResponse = {
        id: '3',
        name: 'New Event',
        at: '2023-03-10T09:00:00Z',
        importance: 'critique',
      };
      global.fetch.mockImplementationOnce(() => mockFetchResponse(mockResponse));

      const eventData = {
        title: 'New Event',
        date: new Date('2023-03-10T09:00:00Z'),
        importance: 'critique',
      };

      const result = await eventService.addEvent(eventData);

      expect(fetch).toHaveBeenCalledWith(`${config.apiUrl}/events/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'New Event',
          importance: 'critique',
          at: eventData.date.toISOString(),
        }),
      });
      expect(result.id).toBe('3');
      expect(result.title).toBe('New Event');
    });

    it('gère les erreurs lors de la création', async () => {
      global.fetch.mockImplementationOnce(() => mockFetchResponse({ detail: 'Invalid data' }, 400));

      const eventData = {
        title: 'Bad Event',
        date: new Date(),
        importance: 'normale',
      };

      await expect(eventService.addEvent(eventData)).rejects.toThrow('Error creating event');
      expect(logger.error).toHaveBeenCalled();
    });

    it('utilise les données de test si useTestData est true', async () => {
      const originalUseTestData = config.useTestData;
      config.useTestData = true;

      const eventData = {
        title: 'Test Mock Event',
        date: new Date('2023-04-15T08:00:00Z'),
        importance: 'haute',
      };

      const result = await eventService.addEvent(eventData);

      expect(fetch).not.toHaveBeenCalled();
      expect(logger.info).toHaveBeenCalledWith('Using test data for addEvent');
      expect(result.title).toBe('Test Mock Event');
      expect(result.importance).toBe('haute');
      expect(result.id).toBeTruthy();

      config.useTestData = originalUseTestData;
    });
  });

  describe('updateEvent', () => {
    it('met à jour correctement un événement existant', async () => {
      const mockResponse = {
        id: '1',
        name: 'Updated Event',
        at: '2023-01-15T10:00:00Z',
        importance: 'critique',
      };
      global.fetch.mockImplementationOnce(() => mockFetchResponse(mockResponse));

      const eventData = {
        title: 'Updated Event',
        date: new Date('2023-01-15T10:00:00Z'),
        importance: 'critique',
      };

      const result = await eventService.updateEvent('1', eventData);

      expect(fetch).toHaveBeenCalledWith(`${config.apiUrl}/events/1`, expect.any(Object));
      expect(result.title).toBe('Updated Event');
      expect(result.importance).toBe('critique');
    });

    it('utilise les données de test si useTestData est true', async () => {
      const originalUseTestData = config.useTestData;
      config.useTestData = true;

      const addedEvent = await eventService.addEvent({
        title: 'Event to Update',
        date: new Date('2023-05-20T10:00:00Z'),
        importance: 'normale',
      });

      const updateData = {
        title: 'Updated Mock Event',
        date: new Date('2023-05-21T11:00:00Z'),
        importance: 'haute',
      };

      const result = await eventService.updateEvent(addedEvent.id, updateData);

      expect(fetch).not.toHaveBeenCalled();
      expect(logger.info).toHaveBeenCalledWith(
        `Using test data for updateEvent with id: ${addedEvent.id}`
      );
      expect(result.title).toBe('Updated Mock Event');
      expect(result.importance).toBe('haute');

      config.useTestData = originalUseTestData;
    });
  });

  describe('deleteEvent', () => {
    it('supprime correctement un événement', async () => {
      global.fetch.mockImplementationOnce(() => mockFetchResponse({}, 204));

      const result = await eventService.deleteEvent('1');

      expect(fetch).toHaveBeenCalledWith(`${config.apiUrl}/events/1`, {
        method: 'DELETE',
      });
      expect(result).toEqual({ id: '1' });
    });

    it('gère les erreurs lors de la suppression', async () => {
      global.fetch.mockImplementationOnce(() =>
        mockFetchResponse({ detail: 'Event not found' }, 404)
      );

      await expect(eventService.deleteEvent('999')).rejects.toThrow('Error deleting event');
      expect(logger.error).toHaveBeenCalled();
    });

    it('utilise les données de test si useTestData est true', async () => {
      const originalUseTestData = config.useTestData;
      config.useTestData = true;

      const addedEvent = await eventService.addEvent({
        title: 'Event to Delete',
        date: new Date(),
        importance: 'normale',
      });

      const result = await eventService.deleteEvent(addedEvent.id);

      expect(fetch).not.toHaveBeenCalled();
      expect(logger.info).toHaveBeenCalledWith(
        `Using test data for deleteEvent with id: ${addedEvent.id}`
      );
      expect(result).toEqual({ id: addedEvent.id });

      config.useTestData = originalUseTestData;
    });
  });
});
