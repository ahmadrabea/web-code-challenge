import flightAvailabilityMock from '../mocks/flightAvailabilityMock.json';

const originalEnv = process.env;

describe('flightApi', () => {
  let searchLocations: any;
  let fetchFlightAvailability: any;

  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    
    process.env = { ...originalEnv };
    process.env.REACT_APP_API_KEY = 'test_key';
    process.env.REACT_APP_API_SECRET = 'test_secret';

    global.fetch = jest.fn();

    const api = require('../services/flightApi');
    searchLocations = api.searchLocations;
    fetchFlightAvailability = api.fetchFlightAvailability;
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('searchLocations', () => {
    it('returns empty array if keyword length is less than 2', async () => {
      const result = await searchLocations('a');
      expect(result).toEqual([]);
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('throws error if API credentials are not configured', async () => {
      delete process.env.REACT_APP_API_KEY;
      delete process.env.REACT_APP_API_SECRET;

      await expect(searchLocations('lon')).rejects.toThrow('Amadeus API credentials not configured');
    });

    it('throws error if token request fails', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
      });

      await expect(searchLocations('lon')).rejects.toThrow('Token request failed: 401 Unauthorized');
    });

    it('throws error if location search request fails', async () => {
      // Mock token success
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ access_token: 'mock_token', expires_in: 3600 }),
      });
      // Mock search failure
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      await expect(searchLocations('lon')).rejects.toThrow('Location search failed: 500');
    });

    it('fetches locations successfully', async () => {
      // Mock token success
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ access_token: 'mock_token', expires_in: 3600 }),
      });
      // Mock search success
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: [
            {
              name: 'Heathrow',
              iataCode: 'LHR',
              subType: 'AIRPORT',
              address: { cityName: 'London', countryCode: 'UK' },
            },
          ],
        }),
      });

      const result = await searchLocations('lon');

      expect(global.fetch).toHaveBeenCalledTimes(2);
      expect(result).toEqual([
        {
          label: 'Heathrow (LHR)',
          iataCode: 'LHR',
          subType: 'AIRPORT',
          cityName: 'London',
          countryCode: 'UK',
        },
      ]);
    });

    it('handles missing data field gracefully', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ access_token: 'mock_token', expires_in: 3600 }),
      });
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

      const result = await searchLocations('lon');
      expect(result).toEqual([]);
    });

    it('caches token for subsequent requests', async () => {
      // Token success
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ access_token: 'mock_token', expires_in: 3600 }),
      });
      // Search 1 success
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [] }),
      });
      // Search 2 success
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [] }),
      });

      await searchLocations('lon');
      await searchLocations('par');

      // 1 token fetch + 2 search fetches = 3 total
      expect(global.fetch).toHaveBeenCalledTimes(3);
    });
  });

  describe('fetchFlightAvailability', () => {
    const mockRequest = {
      originDestinations: [],
      travelers: [],
      sources: ['GDS'],
    };

    beforeEach(() => {
      // Suppress console.warn for the mock fallback test
      jest.spyOn(console, 'warn').mockImplementation(() => {});
    });

    afterEach(() => {
      (console.warn as jest.Mock).mockRestore();
    });

    it('fetches flight availability successfully', async () => {
      // Token success
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ access_token: 'mock_token', expires_in: 3600 }),
      });
      // Flights success
      const mockResponse = { data: [{ id: '1' }] };
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await fetchFlightAvailability(mockRequest);

      expect(global.fetch).toHaveBeenCalledTimes(2);
      expect(result).toEqual(mockResponse);
    });

    it('falls back to mock data when API request fails', async () => {
      // Token success
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ access_token: 'mock_token', expires_in: 3600 }),
      });
      // Flights failure
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });

      const result = await fetchFlightAvailability(mockRequest);

      expect(console.warn).toHaveBeenCalledWith(
        'Amadeus API request failed, falling back to mock data:',
        expect.any(Error)
      );
      expect(result).toEqual(flightAvailabilityMock);
    });
  });
});
