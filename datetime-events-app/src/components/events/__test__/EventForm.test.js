import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EventList from '../EventList';
import { EventProvider } from '../../../context/EventContext';
import * as useEvents from '../../../hooks/useEvents';
import { ThemeProvider } from '@mui/material/styles';
import theme from '../../../theme/theme';

jest.mock('../../../hooks/useEvents', () => ({
  __esModule: true,
  useEvents: jest.fn(),
}));

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

const renderWithProviders = ui => {
  return render(
    <ThemeProvider theme={theme}>
      <EventProvider>{ui}</EventProvider>
    </ThemeProvider>
  );
};

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
    renderWithProviders(<EventList onAdd={jest.fn()} onEdit={jest.fn()} />);

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

    renderWithProviders(<EventList onAdd={jest.fn()} onEdit={jest.fn()} />);

    await waitFor(() => {
      expect(screen.getByText(/aucun événement trouvé/i)).toBeInTheDocument();
    });
  });

  it('appelle la fonction selectEvent et onEdit lors du clic sur éditer', async () => {
    const mockOnEdit = jest.fn();

    renderWithProviders(<EventList onAdd={jest.fn()} onEdit={mockOnEdit} />);

    await waitFor(() => {
      expect(screen.getByTestId('event-item-1')).toBeInTheDocument();
    });

    userEvent.click(screen.getAllByText('Edit')[0]);

    expect(mockUseEvents.selectEvent).toHaveBeenCalledWith(mockEvents[0]);
    expect(mockOnEdit).toHaveBeenCalled();
  });

  it('ouvre la boîte de dialogue de confirmation lors du clic sur supprimer', async () => {
    renderWithProviders(<EventList onAdd={jest.fn()} onEdit={jest.fn()} />);

    await waitFor(() => {
      expect(screen.getByTestId('event-item-1')).toBeInTheDocument();
    });

    userEvent.click(screen.getAllByText('Delete')[0]);

    expect(screen.getByTestId('confirm-dialog')).toBeInTheDocument();
  });

  it("supprime l'événement lorsque la confirmation est acceptée", async () => {
    renderWithProviders(<EventList onAdd={jest.fn()} onEdit={jest.fn()} />);

    await waitFor(() => {
      expect(screen.getByTestId('event-item-1')).toBeInTheDocument();
    });

    userEvent.click(screen.getAllByText('Delete')[0]);

    userEvent.click(screen.getByTestId('confirm-button'));

    expect(mockUseEvents.deleteEvent).toHaveBeenCalled();
  });

  it('affiche un spinner de chargement lorsque loading est true', async () => {
    useEvents.useEvents.mockReturnValue({
      ...mockUseEvents,
      loading: true,
    });

    renderWithProviders(<EventList onAdd={jest.fn()} onEdit={jest.fn()} />);

    expect(screen.queryByTestId('event-item-1')).not.toBeInTheDocument();
  });
});
