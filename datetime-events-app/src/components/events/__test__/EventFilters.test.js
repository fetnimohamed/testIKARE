// Modifier le test pour utiliser fireEvent à la place de userEvent.selectOptions
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EventFilters from '../EventFilters';
import { useEvents } from '../../../hooks/useEvents';
import { ThemeProvider } from '@mui/material/styles';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import theme from '../../../theme/theme';
import { fr } from 'date-fns/locale';

jest.mock('../../../hooks/useEvents', () => ({
  useEvents: jest.fn(),
}));

jest.mock('@mui/x-date-pickers/DatePicker', () => ({
  DatePicker: ({ label, value, onChange }) => {
    return (
      <input
        data-testid={`date-picker-${label?.toLowerCase().replace(/\s+/g, '-')}`}
        type="text"
        value={value?.toISOString?.() || ''}
        onChange={e => onChange(new Date(e.target.value))}
        placeholder={label}
      />
    );
  },
}));

const renderWithProviders = ui => {
  return render(
    <ThemeProvider theme={theme}>
      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={fr}>
        {ui}
      </LocalizationProvider>
    </ThemeProvider>
  );
};

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
    renderWithProviders(<EventFilters />);

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
        endDate: new Date(currentDate.getTime() + 86400000),
        importance: 'haute',
      },
      updateFilters: mockUpdateFilters,
    });

    renderWithProviders(<EventFilters />);

    // Plutôt que de vérifier la valeur, vérifions le texte affiché
    expect(screen.getByText('haute')).toBeInTheDocument();
  });

  it('met à jour les filtres locaux lors des changements', async () => {
    renderWithProviders(<EventFilters />);

    // Simuler l'ouverture et la sélection d'une option dans le select MUI
    const importanceSelect = screen.getByLabelText(/importance/i);
    fireEvent.mouseDown(importanceSelect);

    // Attendre que la liste déroulante apparaisse
    await waitFor(() => {
      const option = screen.getByText('haute');
      fireEvent.click(option);
    });

    // Vérifier que le texte affiché est "haute"
    expect(screen.getByText('haute')).toBeInTheDocument();

    expect(mockUpdateFilters).not.toHaveBeenCalled();
  });

  it('applique les filtres lors du clic sur Appliquer', async () => {
    renderWithProviders(<EventFilters />);

    // Simuler l'ouverture et la sélection d'une option dans le select MUI
    const importanceSelect = screen.getByLabelText(/importance/i);
    fireEvent.mouseDown(importanceSelect);

    // Attendre que la liste déroulante apparaisse
    await waitFor(() => {
      const option = screen.getByText('critique');
      fireEvent.click(option);
    });

    userEvent.click(screen.getByRole('button', { name: /appliquer/i }));

    await waitFor(() => {
      expect(mockUpdateFilters).toHaveBeenCalledWith(
        expect.objectContaining({
          importance: 'critique',
        })
      );
    });
  });

  it('réinitialise les filtres lors du clic sur Réinitialiser', async () => {
    renderWithProviders(<EventFilters />);

    // Simuler l'ouverture et la sélection d'une option dans le select MUI
    const importanceSelect = screen.getByLabelText(/importance/i);
    fireEvent.mouseDown(importanceSelect);

    // Attendre que la liste déroulante apparaisse
    await waitFor(() => {
      const option = screen.getByText('haute');
      fireEvent.click(option);
    });

    userEvent.click(screen.getByRole('button', { name: /réinitialiser/i }));

    await waitFor(() => {
      expect(mockUpdateFilters).toHaveBeenCalledWith({
        startDate: null,
        endDate: null,
        importance: 'all',
      });
    });

    // Vérifier que le texte affiché est "Toutes"
    expect(screen.getByText('Toutes')).toBeInTheDocument();
  });

  it('gère correctement le changement de date de début', async () => {
    renderWithProviders(<EventFilters />);

    const startDateInput = screen.getByTestId('date-picker-date-de-début');
    const newDate = '2023-05-15';

    fireEvent.change(startDateInput, { target: { value: newDate } });

    userEvent.click(screen.getByRole('button', { name: /appliquer/i }));

    await waitFor(() => {
      expect(mockUpdateFilters).toHaveBeenCalledWith(
        expect.objectContaining({
          startDate: expect.any(Date),
        })
      );
    });
  });

  it('gère correctement le changement de date de fin', async () => {
    renderWithProviders(<EventFilters />);

    const endDateInput = screen.getByTestId('date-picker-date-de-fin');
    const newDate = '2023-06-15';

    fireEvent.change(endDateInput, { target: { value: newDate } });

    userEvent.click(screen.getByRole('button', { name: /appliquer/i }));

    await waitFor(() => {
      expect(mockUpdateFilters).toHaveBeenCalledWith(
        expect.objectContaining({
          endDate: expect.any(Date),
        })
      );
    });
  });
});
