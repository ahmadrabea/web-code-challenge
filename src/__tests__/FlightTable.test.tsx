import React from 'react';
import { render, screen } from '@testing-library/react';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { FlightProvider } from '../context/FlightContext';
import { FlightTable } from '../components/FlightTable';

function renderWithProviders(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <FlightProvider>{ui}</FlightProvider>
      </LocalizationProvider>
    </QueryClientProvider>
  );
}

describe('FlightTable', () => {
  it('shows empty state when no data is loaded', () => {
    renderWithProviders(<FlightTable />);
    expect(screen.getByText(/no flight data yet/i)).toBeInTheDocument();
  });

  it('shows instruction text in empty state', () => {
    renderWithProviders(<FlightTable />);
    expect(
      screen.getByText(/use the search form above to find available flights/i)
    ).toBeInTheDocument();
  });
});
