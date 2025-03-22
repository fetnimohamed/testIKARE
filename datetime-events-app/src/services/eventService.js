const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

export const eventService = {
  // Récupérer tous les événements
  async getEvents() {
    try {
      const response = await fetch(`${API_URL}/events/`);
      const data = (await response.json()).items;

      // Normalisez les données
      console.log('Data:', data);

      const normalizedEvents = Array.isArray(data)
        ? data.map(normalizeEvent)
        : data.items
        ? data.items.map(normalizeEvent)
        : [];

      return normalizedEvents;
    } catch (error) {
      console.error('Erreur lors de la récupération des événements:', error);
      return [];
    }
  },

  // Ajouter un nouvel événement
  async addEvent(eventData) {
    const response = await fetch(`${API_URL}/events/`, {
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

    // Adapter la réponse au format attendu par notre application
    return {
      id: data.id,
      title: data.name,
      date: data.at,
      importance: data.importance,
      createdAt: new Date().toISOString(),
    };
  },

  // Récupérer un événement spécifique par ID
  async getEventById(id) {
    try {
      const response = await fetch(`${API_URL}/events/${id}`);

      if (!response.ok) {
        throw new Error(`Event with id ${id} not found`);
      }

      const data = await response.json();
      return normalizeEvent(data);
    } catch (error) {
      console.error(`Erreur lors de la récupération de l'événement ${id}:`, error);
      throw error;
    }
  },

  // Mettre à jour un événement existant
  async updateEvent(id, eventData) {
    try {
      const response = await fetch(`${API_URL}/events/${id}`, {
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

      // Normaliser et retourner la réponse
      return normalizeEvent(data);
    } catch (error) {
      console.error(`Erreur lors de la mise à jour de l'événement ${id}:`, error);
      throw error;
    }
  },

  // Supprimer un événement
  async deleteEvent(id) {
    try {
      const response = await fetch(`${API_URL}/events/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`Error deleting event: ${response.statusText}`);
      }

      return { id };
    } catch (error) {
      console.error(`Erreur lors de la suppression de l'événement ${id}:`, error);
      throw error;
    }
  },
};

// Fonction pour normaliser un événement
function normalizeEvent(event) {
  // Extraire les propriétés en utilisant différents noms possibles
  const id = event.id || '';
  const title = event.title || event.name || '';
  const importance = event.importance || 'normale';

  // Traiter la date avec prudence
  let dateObj;
  try {
    if (event.date) {
      dateObj = new Date(event.date);
    } else if (event.at) {
      dateObj = new Date(event.at);
    } else {
      dateObj = new Date();
    }

    // Vérifier si la date est valide
    if (isNaN(dateObj.getTime())) {
      console.warn("Date invalide pour l'événement:", event);
      dateObj = new Date(); // Fallback à la date actuelle
    }
  } catch (e) {
    console.error('Erreur lors de la conversion de la date:', e);
    dateObj = new Date();
  }

  // Retourner un objet événement normalisé
  return {
    id,
    title,
    date: dateObj.toISOString(), // Format ISO standard
    importance,
  };
}
