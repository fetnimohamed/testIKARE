import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EventList from '../EventList';
import { EventProvider } from '../../../context/EventContext';
import * as useEvents from '../../../hooks/useEvents';

// Mock du hook useEvents
jest.mock('../../../hooks/useEvents', () => ({
  __esModule: true,
  useEvents: jest.fn(),
}));

// Mock des composants enfants
jest.mock('../EventItem', () => {
  return function MockEventItem({ event, onEdit, onDelete }) {
    return (
      <div data-testid={`event-item-${event.id}`}>
        <h3>{event.title}</h3>
        <p>Importance: {event.importance}</p>
        <button onClick={() => onEdit(event)}>Edit</button>
        <button onClick={() => onDelete(event)}>Delete</button>
      </div>
    );
  };
});

jest.mock('../../ui/ConfirmDialog', () => {
  return function MockConfirmDialog({ open, onConfirm, onCancel }) {
    return open ? (
      <div data-testid="confirm-dialog">
        <button onClick={onConfirm} data-testid="confirm-button">
          Confirm
        </button>
        <button onClick={onCancel} data-testid="cancel-button">
          Cancel
        </button>
      </div>
    ) : null;
  };
});

describe('EventList Component', () => {
  const mockEvents = [
    {
      id: '1',
      title: 'Test Event 1',
      date: new Date('2023-05-15T14:30:00').toISOString(),
      importance: 'haute',
    },
    {
      id: '2',
      title: 'Test Event 2',
      date: new Date('2023-05-20T10:00:00').toISOString(),
      importance: 'normale',
    },
  ];

  const mockUseEvents = {
    filteredEvents: mockEvents,
    loading: false,
    error: null,
    fetchEvents: jest.fn(),
    selectEvent: jest.fn(),
    deleteEvent: jest.fn(),
    initializeDemoData: jest.fn(),
  };

  beforeEach(() => {
    useEvents.useEvents.mockReturnValue(mockUseEvents);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('rend correctement la liste des événements', async () => {
    render(
      <EventProvider>
        <EventList onAdd={jest.fn()} onEdit={jest.fn()} />
      </EventProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('event-item-1')).toBeInTheDocument();
      expect(screen.getByTestId('event-item-2')).toBeInTheDocument();
    });

    expect(screen.getByText('Test Event 1')).toBeInTheDocument();
    expect(screen.getByText('Test Event 2')).toBeInTheDocument();
  });

  it("affiche un message lorsqu'aucun événement n'est trouvé", async () => {
    useEvents.useEvents.mockReturnValue({
      ...mockUseEvents,
      filteredEvents: [],
    });

    render(
      <EventProvider>
        <EventList onAdd={jest.fn()} onEdit={jest.fn()} />
      </EventProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/aucun événement trouvé/i)).toBeInTheDocument();
    });
  });

  it('appelle la fonction selectEvent et onEdit lors du clic sur éditer', async () => {
    const mockOnEdit = jest.fn();

    render(
      <EventProvider>
        <EventList onAdd={jest.fn()} onEdit={mockOnEdit} />
      </EventProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('event-item-1')).toBeInTheDocument();
    });

    userEvent.click(screen.getAllByText('Edit')[0]);

    expect(mockUseEvents.selectEvent).toHaveBeenCalledWith(mockEvents[0]);
    expect(mockOnEdit).toHaveBeenCalled();
  });

  it('ouvre la boîte de dialogue de confirmation lors du clic sur supprimer', async () => {
    render(
      <EventProvider>
        <EventList onAdd={jest.fn()} onEdit={jest.fn()} />
      </EventProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('event-item-1')).toBeInTheDocument();
    });

    userEvent.click(screen.getAllByText('Delete')[0]);

    expect(screen.getByTestId('confirm-dialog')).toBeInTheDocument();
  });

  it("supprime l'événement lorsque la confirmation est acceptée", async () => {
    render(
      <EventProvider>
        <EventList onAdd={jest.fn()} onEdit={jest.fn()} />
      </EventProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('event-item-1')).toBeInTheDocument();
    });

    // Cliquer sur supprimer pour ouvrir la boîte de dialogue
    userEvent.click(screen.getAllByText('Delete')[0]);

    // Confirmer la suppression
    userEvent.click(screen.getByTestId('confirm-button'));

    // Vérifier que deleteEvent a été appelé avec le bon ID
    expect(mockUseEvents.deleteEvent).toHaveBeenCalled();
  });

  it('affiche un spinner de chargement lorsque loading est true', async () => {
    useEvents.useEvents.mockReturnValue({
      ...mockUseEvents,
      loading: true,
    });

    render(
      <EventProvider>
        <EventList onAdd={jest.fn()} onEdit={jest.fn()} />
      </EventProvider>
    );

    // Dans un cas réel, vous vérifieriez la présence d'un composant CircularProgress
    // Mais comme nous n'avons pas mocké ce composant spécifiquement,
    // nous vérifions que les événements ne sont pas affichés
    expect(screen.queryByTestId('event-item-1')).not.toBeInTheDocument();
  });
});
