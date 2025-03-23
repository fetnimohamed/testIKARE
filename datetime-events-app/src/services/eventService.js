import config from '../config';
import logger from '../services/logger';

export const eventService = {
  async getEvents() {
    if (config.useTestData) {
      logger.info('Using test data for getEvents');
      return getMockEvents().map(normalizeEvent);
    }

    try {
      const response = await fetch(`${config.apiUrl}/events/`);
      const data = (await response.json()).items;

      logger.debug('API response data:', data);

      const normalizedEvents = Array.isArray(data)
        ? data.map(normalizeEvent)
        : data.items
          ? data.items.map(normalizeEvent)
          : [];

      return normalizedEvents;
    } catch (error) {
      logger.error('Erreur lors de la récupération des événements:', error);
      return [];
    }
  },

  async addEvent(eventData) {
    if (config.useTestData) {
      logger.info('Using test data for addEvent');
      const mockEvent = createMockEvent(eventData);
      return normalizeEvent(mockEvent);
    }

    try {
      const response = await fetch(`${config.apiUrl}/events/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: eventData.title,
          importance: eventData.importance,
          at: eventData.date.toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error(`Error creating event: ${response.statusText}`);
      }

      const data = await response.json();

      return {
        id: data.id,
        title: data.name,
        date: data.at,
        importance: data.importance,
        createdAt: new Date().toISOString(),
      };
    } catch (error) {
      logger.error("Erreur lors de la création d'événement:", error);
      throw error;
    }
  },

  async getEventById(id) {
    if (config.useTestData) {
      logger.info(`Using test data for getEventById with id: ${id}`);
      const mockEvent = getMockEventById(id);
      if (!mockEvent) {
        throw new Error(`Event with id ${id} not found in test data`);
      }
      return normalizeEvent(mockEvent);
    }

    try {
      const response = await fetch(`${config.apiUrl}/events/${id}`);

      if (!response.ok) {
        throw new Error(`Event with id ${id} not found`);
      }

      const data = await response.json();
      return normalizeEvent(data);
    } catch (error) {
      logger.error(`Erreur lors de la récupération de l'événement ${id}:`, error);
      throw error;
    }
  },

  async updateEvent(id, eventData) {
    if (config.useTestData) {
      logger.info(`Using test data for updateEvent with id: ${id}`);
      const updatedMockEvent = updateMockEvent(id, eventData);
      if (!updatedMockEvent) {
        throw new Error(`Event with id ${id} not found in test data`);
      }
      return normalizeEvent(updatedMockEvent);
    }

    try {
      const response = await fetch(`${config.apiUrl}/events/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: eventData.title,
          importance: eventData.importance,
          at: eventData.date ? eventData.date.toISOString() : undefined,
        }),
      });

      if (!response.ok) {
        throw new Error(`Error updating event: ${response.statusText}`);
      }

      const data = await response.json();

      return normalizeEvent(data);
    } catch (error) {
      logger.error(`Erreur lors de la mise à jour de l'événement ${id}:`, error);
      throw error;
    }
  },

  async deleteEvent(id) {
    if (config.useTestData) {
      logger.info(`Using test data for deleteEvent with id: ${id}`);
      const success = deleteMockEvent(id);
      if (!success) {
        throw new Error(`Event with id ${id} not found in test data`);
      }
      return { id };
    }

    try {
      const response = await fetch(`${config.apiUrl}/events/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`Error deleting event: ${response.statusText}`);
      }

      return { id };
    } catch (error) {
      logger.error(`Erreur lors de la suppression de l'événement ${id}:`, error);
      throw error;
    }
  },
};

function normalizeEvent(event) {
  const id = event.id || '';
  const title = event.title || event.name || '';
  const importance = event.importance || 'normale';

  let dateObj;
  try {
    if (event.date) {
      dateObj = new Date(event.date);
    } else if (event.at) {
      dateObj = new Date(event.at);
    } else {
      dateObj = new Date();
    }

    if (isNaN(dateObj.getTime())) {
      logger.warn("Date invalide pour l'événement:", event);
      dateObj = new Date();
    }
  } catch (e) {
    logger.error('Erreur lors de la conversion de la date:', e);
    dateObj = new Date();
  }

  return {
    id,
    title,
    date: dateObj.toISOString(),
    importance,
  };
}

let mockEvents = [
  {
    id: '1',
    name: 'Test Event 1',
    at: '2023-01-15T10:00:00Z',
    importance: 'haute',
  },
  {
    id: '2',
    name: 'Test Event 2',
    at: '2023-02-20T14:30:00Z',
    importance: 'normale',
  },
];

function getMockEvents() {
  return [...mockEvents];
}

function getMockEventById(id) {
  return mockEvents.find(event => event.id === id);
}

function createMockEvent(eventData) {
  const newId = (parseInt(mockEvents[mockEvents.length - 1]?.id || '0') + 1).toString();
  const newEvent = {
    id: newId,
    name: eventData.title,
    at: eventData.date.toISOString(),
    importance: eventData.importance,
  };
  mockEvents.push(newEvent);
  return newEvent;
}

function updateMockEvent(id, eventData) {
  const index = mockEvents.findIndex(event => event.id === id);
  if (index === -1) return null;

  mockEvents[index] = {
    ...mockEvents[index],
    name: eventData.title,
    at: eventData.date ? eventData.date.toISOString() : mockEvents[index].at,
    importance: eventData.importance,
  };

  return mockEvents[index];
}

function deleteMockEvent(id) {
  const index = mockEvents.findIndex(event => event.id === id);
  if (index === -1) return false;

  mockEvents.splice(index, 1);
  return true;
}
