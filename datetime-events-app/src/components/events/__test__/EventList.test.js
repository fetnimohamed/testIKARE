import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EventForm from '../EventForm';
import { EventProvider } from '../../../context/EventContext';
import * as useEvents from '../../../hooks/useEvents';

// Mock du hook useEvents
jest.mock('../../../hooks/useEvents', () => ({
  __esModule: true,
  useEvents: jest.fn(),
}));

// Mocks pour DateTimePicker, qui est un composant complexe
jest.mock('@mui/x-date-pickers/DateTimePicker', () => ({
  DateTimePicker: ({ label, value, onChange, renderInput }) => {
    return renderInput({
      value: value?.toISOString() || '',
      onChange: e => onChange(new Date(e.target.value)),
      inputProps: { 'data-testid': 'date-time-picker' },
    });
  },
}));

describe('EventForm Component', () => {
  const mockUseEvents = {
    selectedEvent: null,
    createEvent: jest.fn(),
    updateEvent: jest.fn(),
    loading: false,
    error: null,
  };

  beforeEach(() => {
    useEvents.useEvents.mockReturnValue(mockUseEvents);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('rend correctement le formulaire de création', () => {
    render(
      <EventProvider>
        <EventForm open={true} onClose={jest.fn()} />
      </EventProvider>
    );

    expect(screen.getByText('Créer un nouvel événement')).toBeInTheDocument();
    expect(screen.getByLabelText(/titre de l'événement/i)).toBeInTheDocument();
    expect(screen.getByTestId('date-time-picker')).toBeInTheDocument();
    expect(screen.getByLabelText(/importance/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /créer/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /annuler/i })).toBeInTheDocument();
  });

  it("pré-remplit le formulaire avec les données de l'événement sélectionné", () => {
    const selectedEvent = {
      id: '1',
      title: 'Test Event',
      date: new Date('2023-05-15T14:30:00'),
      importance: 'haute',
      description: 'Test description',
    };

    useEvents.useEvents.mockReturnValue({
      ...mockUseEvents,
      selectedEvent,
    });

    render(
      <EventProvider>
        <EventForm open={true} onClose={jest.fn()} />
      </EventProvider>
    );

    expect(screen.getByText("Modifier l'événement")).toBeInTheDocument();
    expect(screen.getByLabelText(/titre de l'événement/i)).toHaveValue('Test Event');
    expect(screen.getByLabelText(/description/i)).toHaveValue('Test description');
  });

  it('appelle createEvent avec les données correctes', async () => {
    const mockOnClose = jest.fn();
    const createEvent = jest.fn().mockResolvedValue({});

    useEvents.useEvents.mockReturnValue({
      ...mockUseEvents,
      createEvent,
    });

    render(
      <EventProvider>
        <EventForm open={true} onClose={mockOnClose} />
      </EventProvider>
    );

    // Remplir le formulaire
    userEvent.type(screen.getByLabelText(/titre de l'événement/i), 'New Event');
    userEvent.type(screen.getByLabelText(/description/i), 'New description');

    // Soumettre le formulaire
    userEvent.click(screen.getByRole('button', { name: /créer/i }));

    // Vérifier que createEvent a été appelé avec les bonnes données
    await waitFor(() => {
      expect(createEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'New Event',
          description: 'New description',
          importance: 'normale', // valeur par défaut
          date: expect.any(Date),
        })
      );
    });

    // Vérifier que onClose a été appelé
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('appelle updateEvent avec les données correctes', async () => {
    const mockOnClose = jest.fn();
    const updateEvent = jest.fn().mockResolvedValue({});

    const selectedEvent = {
      id: '1',
      title: 'Test Event',
      date: new Date('2023-05-15T14:30:00'),
      importance: 'normale',
      description: 'Test description',
    };

    useEvents.useEvents.mockReturnValue({
      ...mockUseEvents,
      selectedEvent,
      updateEvent,
    });

    render(
      <EventProvider>
        <EventForm open={true} onClose={mockOnClose} />
      </EventProvider>
    );

    // Modifier le titre
    const titleInput = screen.getByLabelText(/titre de l'événement/i);
    userEvent.clear(titleInput);
    userEvent.type(titleInput, 'Updated Event');

    // Soumettre le formulaire
    userEvent.click(screen.getByRole('button', { name: /mettre à jour/i }));

    // Vérifier que updateEvent a été appelé avec les bonnes données
    await waitFor(() => {
      expect(updateEvent).toHaveBeenCalledWith(
        '1',
        expect.objectContaining({
          title: 'Updated Event',
          description: 'Test description',
          importance: 'normale',
          date: expect.any(Date),
        })
      );
    });

    // Vérifier que onClose a été appelé
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('affiche une erreur si le titre est vide', async () => {
    render(
      <EventProvider>
        <EventForm open={true} onClose={jest.fn()} />
      </EventProvider>
    );

    // Soumettre le formulaire sans remplir le titre
    const titleInput = screen.getByLabelText(/titre de l'événement/i);
    userEvent.clear(titleInput);
    userEvent.click(screen.getByRole('button', { name: /créer/i }));

    // Vérifier que l'erreur s'affiche
    expect(await screen.findByText(/le titre est requis/i)).toBeInTheDocument();
    expect(mockUseEvents.createEvent).not.toHaveBeenCalled();
  });

  it('ferme le formulaire lors du clic sur annuler', () => {
    const mockOnClose = jest.fn();

    render(
      <EventProvider>
        <EventForm open={true} onClose={mockOnClose} />
      </EventProvider>
    );

    userEvent.click(screen.getByRole('button', { name: /annuler/i }));
    expect(mockOnClose).toHaveBeenCalled();
  });
});
