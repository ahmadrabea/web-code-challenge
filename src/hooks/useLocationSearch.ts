import { useQuery } from '@tanstack/react-query';
import { searchLocations } from '../services/flightApi';

export function useLocationSearch(keyword: string) {
  return useQuery({
    queryKey: ['locations', keyword.toLowerCase()] as const,
    queryFn: () => searchLocations(keyword),
    enabled: keyword.length >= 2,
    staleTime: 10 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
    placeholderData: (prev) => prev,
  });
}
