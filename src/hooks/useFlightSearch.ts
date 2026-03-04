import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FlightAvailabilityRequest } from '../types/flightTypes';
import { fetchFlightAvailability } from '../services/flightApi';
import { transformFlightData } from '../utils/flightDataTransformer';
import { useFlightContext } from '../context/FlightContext';

export function useFlightSearch() {
  const { state, dispatch } = useFlightContext();

  const query = useQuery({
    queryKey: ['flights', state.searchParams] as const,
    queryFn: async () => {
      const response = await fetchFlightAvailability(state.searchParams!);
      return transformFlightData(response, state.airportNames);
    },
    enabled: !!state.searchParams,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  useEffect(() => {
    if (query.data) {
      dispatch({ type: 'SET_DATA', payload: query.data });
    }
  }, [query.data, dispatch]);

  const searchFlights = (request: FlightAvailabilityRequest, airportNames: Record<string, string> = {}) => {
    dispatch({ type: 'SET_SEARCH_PARAMS', payload: { request, airportNames } });
  };

  return {
    ...query,
    searchFlights,
    noResults: query.isSuccess && query.data?.length === 0,
  };
}
