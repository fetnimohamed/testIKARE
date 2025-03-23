import React, { useState } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { fr } from 'date-fns/locale';
import theme from './theme/theme';
import { EventProvider } from './context/EventContext';
import Header from './components/layout/Header';
import EventListPage from './components/events/EventListPage';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={fr}>
        <EventProvider>
          <div className="App">
            <Header />
            <EventListPage />
          </div>
        </EventProvider>
      </LocalizationProvider>
    </ThemeProvider>
  );
}

export default App;
