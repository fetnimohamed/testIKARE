import { eventService } from '../eventService';

// Mock de fetch global
global.fetch = jest.fn();

// Helper pour simuler les réponses de l'API
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
  });

  describe('getEvents', () => {
    it('récupère et normalise correctement les événements', async () => {
      // Mock de la réponse API
      const mockEvents = {
        items: [
          { id: '1', name: 'Test Event 1', at: '2023-01-15T10:00:00Z', importance: 'haute' },
          { id: '2', name: 'Test Event 2', at: '2023-02-20T14:30:00Z', importance: 'normale' },
        ],
      };
      global.fetch.mockImplementationOnce(() => mockFetchResponse(mockEvents));

      // Appel du service
      const result = await eventService.getEvents();

      // Vérification des résultats
      expect(fetch).toHaveBeenCalledWith('http://localhost:8000/api/events/');
      expect(result).toHaveLength(2);
      expect(result[0].title).toBe('Test Event 1');
      expect(result[1].importance).toBe('normale');
      // Vérification que les dates sont formatées en ISO
      expect(new Date(result[0].date).toISOString()).toBe(result[0].date);
    });

    it('gère correctement les erreurs', async () => {
      // Simuler une erreur réseau
      global.fetch.mockImplementationOnce(() => Promise.reject(new Error('Network error')));

      // Intercepter les log d'erreur pour le test
      console.error = jest.fn();

      const result = await eventService.getEvents();

      expect(result).toEqual([]);
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('addEvent', () => {
    it('envoie correctement un nouvel événement', async () => {
      // Mock de la réponse API
      const mockResponse = {
        id: '3',
        name: 'New Event',
        at: '2023-03-10T09:00:00Z',
        importance: 'critique',
      };
      global.fetch.mockImplementationOnce(() => mockFetchResponse(mockResponse));

      // Données à envoyer
      const eventData = {
        title: 'New Event',
        date: new Date('2023-03-10T09:00:00Z'),
        importance: 'critique',
      };

      // Appel du service
      const result = await eventService.addEvent(eventData);

      // Vérification des résultats
      expect(fetch).toHaveBeenCalledWith('http://localhost:8000/api/events/', {
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
      // Simuler une erreur HTTP
      global.fetch.mockImplementationOnce(() => mockFetchResponse({ detail: 'Invalid data' }, 400));

      // Données à envoyer
      const eventData = {
        title: 'Bad Event',
        date: new Date(),
        importance: 'normale',
      };

      // Vérifier que l'erreur est bien levée
      await expect(eventService.addEvent(eventData)).rejects.toThrow('Error creating event');
    });
  });

  describe('updateEvent', () => {
    it('met à jour correctement un événement existant', async () => {
      // Mock de la réponse API
      const mockResponse = {
        id: '1',
        name: 'Updated Event',
        at: '2023-01-15T10:00:00Z',
        importance: 'critique',
      };
      global.fetch.mockImplementationOnce(() => mockFetchResponse(mockResponse));

      // Données à envoyer
      const eventData = {
        title: 'Updated Event',
        date: new Date('2023-01-15T10:00:00Z'),
        importance: 'critique',
      };

      // Appel du service
      const result = await eventService.updateEvent('1', eventData);

      // Vérification des résultats
      expect(fetch).toHaveBeenCalledWith('http://localhost:8000/api/events/1', expect.any(Object));
      expect(result.title).toBe('Updated Event');
      expect(result.importance).toBe('critique');
    });
  });

  describe('deleteEvent', () => {
    it('supprime correctement un événement', async () => {
      // Mock de la réponse API (pour une suppression réussie, généralement vide)
      global.fetch.mockImplementationOnce(() => mockFetchResponse({}, 204));

      // Appel du service
      const result = await eventService.deleteEvent('1');

      // Vérification des résultats
      expect(fetch).toHaveBeenCalledWith('http://localhost:8000/api/events/1', {
        method: 'DELETE',
      });
      expect(result).toEqual({ id: '1' });
    });

    it('gère les erreurs lors de la suppression', async () => {
      // Simuler une erreur HTTP
      global.fetch.mockImplementationOnce(() =>
        mockFetchResponse({ detail: 'Event not found' }, 404)
      );

      // Vérifier que l'erreur est bien levée
      await expect(eventService.deleteEvent('999')).rejects.toThrow('Error deleting event');
    });
  });
});
