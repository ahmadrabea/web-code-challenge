import React from 'react';
import { Box, Typography, CssBaseline } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import { FlightProvider } from './context/FlightContext';
import { FlightSearchForm } from './components/FlightSearchForm';
import { FlightTable } from './components/FlightTable';

const theme = createTheme({
  palette: {
    primary: { main: '#1976d2' },
    background: { default: '#f0f4f8' },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
  shape: { borderRadius: 8 },
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <FlightProvider>
            <Box
              sx={{
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #f0f4f8 0%, #e2e8f0 100%)',
                py: 4,
                px: { xs: 2, md: 4 },
              }}
            >
              <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    mb: 3,
                  }}
                >
                  <FlightTakeoffIcon
                    sx={{ fontSize: 36, color: 'primary.main' }}
                  />
                  <Box>
                    <Typography variant="h4" fontWeight={700} color="text.primary">
                      Flight Inspirations
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Admin Dashboard — Search, view and manage flight availability
                    </Typography>
                  </Box>
                </Box>

                <FlightSearchForm />
                <FlightTable />
              </Box>
            </Box>
          </FlightProvider>
        </LocalizationProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
