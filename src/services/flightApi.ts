import { FlightAvailabilityRequest, FlightAvailabilityResponse, LocationSuggestion } from '../types/flightTypes';
import flightAvailabilityMock from '../mocks/flightAvailabilityMock.json';

const TOKEN_URL = '/amadeus-api/v1/security/oauth2/token';
const AVAILABILITY_URL = '/amadeus-api/v1/shopping/availability/flight-availabilities';
const LOCATIONS_URL = '/amadeus-api/v1/reference-data/locations';

let cachedToken: string | null = null;
let tokenExpiry: number = 0;

async function getAmadeusToken(): Promise<string> {
  if (cachedToken && Date.now() < tokenExpiry) {
    return cachedToken;
  }

  const apiKey = process.env.REACT_APP_API_KEY;
  const apiSecret = process.env.REACT_APP_API_SECRET;

  if (!apiKey || !apiSecret) {
    throw new Error('Amadeus API credentials not configured');
  }

  const body = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: apiKey,
    client_secret: apiSecret,
  });

  const response = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });

  if (!response.ok) {
    throw new Error(`Token request failed: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  cachedToken = data.access_token;
  tokenExpiry = Date.now() + data.expires_in * 1000 - 60_000;
  return cachedToken!;
}

export async function searchLocations(keyword: string): Promise<LocationSuggestion[]> {
  if (keyword.length < 2) return [];

  const token = await getAmadeusToken();
  const params = new URLSearchParams({
    keyword,
    subType: 'AIRPORT',
    'page[limit]': '7',
  });

  const response = await fetch(`${LOCATIONS_URL}?${params}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error(`Location search failed: ${response.status}`);
  }

  const json = await response.json();
  return (json.data || []).map((item: any) => ({
    label: `${item.name} (${item.iataCode})`,
    iataCode: item.iataCode,
    subType: item.subType,
    cityName: item.address?.cityName,
    countryCode: item.address?.countryCode,
  }));
}

export async function fetchFlightAvailability(
  request: FlightAvailabilityRequest
): Promise<FlightAvailabilityResponse> {
  try {
    const token = await getAmadeusToken();

    const response = await fetch(AVAILABILITY_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.warn('Amadeus API request failed, falling back to mock data:', error);
    return flightAvailabilityMock as unknown as FlightAvailabilityResponse;
  }
}
