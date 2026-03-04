import React from 'react';
import { render, screen } from '@testing-library/react';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { FlightProvider } from '../context/FlightContext';
import { FlightSearchForm } from '../components/FlightSearchForm';

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

describe('FlightSearchForm', () => {
  it('renders all form fields and submit button', () => {
    renderWithProviders(<FlightSearchForm />);

    expect(screen.getByLabelText(/origin/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/destination/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/departure date/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /search/i })).toBeInTheDocument();
  });

  it('search button is disabled when no locations are selected', () => {
    renderWithProviders(<FlightSearchForm />);
    const button = screen.getByRole('button', { name: /search/i });
    expect(button).toBeDisabled();
  });

  it('renders origin with city name placeholder', () => {
    renderWithProviders(<FlightSearchForm />);
    expect(screen.getByPlaceholderText(/dubai/i)).toBeInTheDocument();
  });

  it('renders destination with city name placeholder', () => {
    renderWithProviders(<FlightSearchForm />);
    expect(screen.getByPlaceholderText(/paris/i)).toBeInTheDocument();
  });
});
