import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

jest.mock('./components/layout/Header', () => () => <div data-testid="header">Header</div>);
jest.mock('./components/events/EventListPage', () => () => (
  <div data-testid="event-list-page">Event List Page</div>
));
jest.mock('./context/EventContext', () => ({
  EventProvider: ({ children }) => <div data-testid="event-provider">{children}</div>,
}));

jest.mock('@mui/material/styles', () => ({
  ThemeProvider: ({ children }) => <div data-testid="theme-provider">{children}</div>,
}));
jest.mock('@mui/material/CssBaseline', () => () => (
  <div data-testid="css-baseline">CssBaseline</div>
));
jest.mock('@mui/x-date-pickers', () => ({
  LocalizationProvider: ({ children }) => <div data-testid="localization-provider">{children}</div>,
}));
jest.mock('@mui/x-date-pickers/AdapterDateFns', () => ({
  AdapterDateFns: jest.fn(),
}));

jest.mock('./theme/theme', () => ({}));

describe('App', () => {
  it('renders without crashing', () => {
    render(<App />);

    expect(screen.getByTestId('theme-provider')).toBeInTheDocument();
    expect(screen.getByTestId('css-baseline')).toBeInTheDocument();
    expect(screen.getByTestId('localization-provider')).toBeInTheDocument();
    expect(screen.getByTestId('event-provider')).toBeInTheDocument();
    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('event-list-page')).toBeInTheDocument();
  });

  it('renders the App div correctly', () => {
    render(<App />);

    const appDiv = screen.getByTestId('event-provider');
    expect(appDiv).toBeInTheDocument();
  });

  it('provides theme, date localization and event context', () => {
    render(<App />);

    const themeProvider = screen.getByTestId('theme-provider');
    expect(themeProvider).toBeInTheDocument();

    const localizationProvider = screen.getByTestId('localization-provider');
    expect(localizationProvider).toBeInTheDocument();

    const eventProvider = screen.getByTestId('event-provider');
    expect(eventProvider).toBeInTheDocument();

    expect(themeProvider).toContainElement(screen.getByTestId('css-baseline'));
    expect(localizationProvider).toContainElement(screen.getByTestId('event-provider'));
    expect(eventProvider).toContainElement(screen.getByTestId('header'));
  });
});
