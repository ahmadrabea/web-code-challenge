import React, { useState, useCallback } from 'react';
import {
  Box,
  Button,
  Paper,
  Typography,
  CircularProgress,
  Alert,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import SearchIcon from '@mui/icons-material/Search';
import dayjs, { Dayjs } from 'dayjs';
import { LocationSuggestion } from '../types/flightTypes';
import { useFlightSearch } from '../hooks/useFlightSearch';
import { LocationAutocomplete } from './LocationAutocomplete';

export function FlightSearchForm() {
  const { isLoading, isFetching, error, noResults, searchFlights } = useFlightSearch();

  const [origin, setOrigin] = useState<LocationSuggestion | null>(null);
  const [destination, setDestination] = useState<LocationSuggestion | null>(null);
  const [date, setDate] = useState<Dayjs | null>(dayjs());

  const busy = isLoading || isFetching;

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!origin || !destination || !date) return;

      const airportNames: Record<string, string> = {};
      if (origin.label) {
        airportNames[origin.iataCode] = origin.label.replace(/\s*\([^)]*\)\s*$/, '');
      }
      if (destination.label) {
        airportNames[destination.iataCode] = destination.label.replace(/\s*\([^)]*\)\s*$/, '');
      }

      searchFlights(
        {
          originDestinations: [
            {
              id: '1',
              originLocationCode: origin.iataCode,
              destinationLocationCode: destination.iataCode,
              departureDateTime: { date: date.format('YYYY-MM-DD') },
            },
          ],
          travelers: [{ id: '1', travelerType: 'ADULT' }],
          sources: ['GDS'],
        },
        airportNames,
      );
    },
    [origin, destination, date, searchFlights]
  );

  return (
    <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2.5 }}>
        <FlightTakeoffIcon color="primary" />
        <Typography variant="h6" fontWeight={600}>
          Search Flights
        </Typography>
      </Box>

      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          display: 'flex',
          gap: 2,
          flexWrap: 'wrap',
          alignItems: 'flex-start',
        }}
      >
        <LocationAutocomplete
          label="Origin"
          placeholder="e.g. Dubai, London..."
          value={origin}
          onChange={setOrigin}
        />
        <LocationAutocomplete
          label="Destination"
          placeholder="e.g. Paris, New York..."
          value={destination}
          onChange={setDestination}
        />
        <DatePicker
          label="Departure Date"
          value={date}
          onChange={setDate}
          slotProps={{ textField: { size: 'small', required: true, sx: { width: 180 } } }}
        />
        <Button
          type="submit"
          variant="contained"
          disabled={busy || !origin || !destination || !date}
          startIcon={busy ? <CircularProgress size={18} color="inherit" /> : <SearchIcon />}
          sx={{ height: 40, textTransform: 'none', fontWeight: 600, px: 3 }}
        >
          {busy ? 'Searching...' : 'Search'}
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error instanceof Error ? error.message : 'An unexpected error occurred'}
        </Alert>
      )}

      {noResults && (
        <Alert severity="warning" sx={{ mt: 2 }}>
          No flights found for the given criteria.
        </Alert>
      )}
    </Paper>
  );
}
