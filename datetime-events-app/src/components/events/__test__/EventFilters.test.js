import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EventFilters from '../EventFilters';
import { useEvents } from '../../../hooks/useEvents';

// Mock du hook useEvents
jest.mock('../../../hooks/useEvents', () => ({
  useEvents: jest.fn(),
}));

// Mocks pour les composants de date
jest.mock('@mui/x-date-pickers/DatePicker', () => ({
  DatePicker: ({ label, value, onChange, renderInput }) => {
    return renderInput({
      value: value?.toISOString?.() || '',
      onChange: e => onChange(new Date(e.target.value)),
      placeholder: label,
      'data-testid': `date-picker-${label?.toLowerCase().replace(/\s+/g, '-')}`,
    });
  },
}));

describe('EventFilters Component', () => {
  const mockUpdateFilters = jest.fn();
  const mockFilters = {
    startDate: null,
    endDate: null,
    importance: 'all',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    useEvents.mockReturnValue({
      filters: mockFilters,
      updateFilters: mockUpdateFilters,
    });
  });

  it('rend correctement le composant de filtres', () => {
    render(<EventFilters />);

    // Vérifier que les éléments clés sont rendus
    expect(screen.getByText(/filtres/i)).toBeInTheDocument();
    expect(screen.getByTestId('date-picker-date-de-début')).toBeInTheDocument();
    expect(screen.getByTestId('date-picker-date-de-fin')).toBeInTheDocument();
    expect(screen.getByLabelText(/importance/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /appliquer/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /réinitialiser/i })).toBeInTheDocument();
  });

  it('initialise les filtres à partir des valeurs actuelles', () => {
    const currentDate = new Date();

    useEvents.mockReturnValue({
      filters: {
        startDate: currentDate,
        endDate: new Date(currentDate.getTime() + 86400000), // tomorrow
        importance: 'haute',
      },
      updateFilters: mockUpdateFilters,
    });

    render(<EventFilters />);

    // Vérifier que le sélecteur d'importance a la bonne valeur
    expect(screen.getByLabelText(/importance/i)).toHaveValue('haute');
  });

  it('met à jour les filtres locaux lors des changements', async () => {
    render(<EventFilters />);

    // Changer l'importance
    const importanceSelect = screen.getByLabelText(/importance/i);
    userEvent.selectOptions(importanceSelect, 'haute');

    // Vérifier que l'option sélectionnée a changé
    expect(importanceSelect).toHaveValue('haute');

    // À ce stade, updateFilters ne devrait pas encore être appelé (jusqu'à ce qu'on clique sur Appliquer)
    expect(mockUpdateFilters).not.toHaveBeenCalled();
  });

  it('applique les filtres lors du clic sur Appliquer', async () => {
    render(<EventFilters />);

    // Changer l'importance
    const importanceSelect = screen.getByLabelText(/importance/i);
    userEvent.selectOptions(importanceSelect, 'critique');

    // Simuler le clic sur Appliquer
    userEvent.click(screen.getByRole('button', { name: /appliquer/i }));

    // Vérifier que updateFilters a été appelé avec les bonnes valeurs
    await waitFor(() => {
      expect(mockUpdateFilters).toHaveBeenCalledWith(
        expect.objectContaining({
          importance: 'critique',
        })
      );
    });
  });

  it('réinitialise les filtres lors du clic sur Réinitialiser', async () => {
    render(<EventFilters />);

    // Changer l'importance
    const importanceSelect = screen.getByLabelText(/importance/i);
    userEvent.selectOptions(importanceSelect, 'haute');

    // Simuler le clic sur Réinitialiser
    userEvent.click(screen.getByRole('button', { name: /réinitialiser/i }));

    // Vérifier que updateFilters a été appelé avec les valeurs réinitialisées
    await waitFor(() => {
      expect(mockUpdateFilters).toHaveBeenCalledWith({
        startDate: null,
        endDate: null,
        importance: 'all',
      });
    });

    // Vérifier que le sélecteur d'importance a été réinitialisé localement
    expect(importanceSelect).toHaveValue('all');
  });

  it('gère correctement le changement de date de début', async () => {
    render(<EventFilters />);

    // Simuler un changement de date de début
    const startDateInput = screen.getByTestId('date-picker-date-de-début');
    const newDate = '2023-05-15';

    fireEvent.change(startDateInput, { target: { value: newDate } });

    // Simuler le clic sur Appliquer
    userEvent.click(screen.getByRole('button', { name: /appliquer/i }));

    // Vérifier que updateFilters a été appelé avec la nouvelle date
    await waitFor(() => {
      expect(mockUpdateFilters).toHaveBeenCalledWith(
        expect.objectContaining({
          startDate: expect.any(Date),
        })
      );
    });
  });

  it('gère correctement le changement de date de fin', async () => {
    render(<EventFilters />);

    // Simuler un changement de date de fin
    const endDateInput = screen.getByTestId('date-picker-date-de-fin');
    const newDate = '2023-06-15';

    fireEvent.change(endDateInput, { target: { value: newDate } });

    // Simuler le clic sur Appliquer
    userEvent.click(screen.getByRole('button', { name: /appliquer/i }));

    // Vérifier que updateFilters a été appelé avec la nouvelle date
    await waitFor(() => {
      expect(mockUpdateFilters).toHaveBeenCalledWith(
        expect.objectContaining({
          endDate: expect.any(Date),
        })
      );
    });
  });
});
w