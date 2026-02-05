import flightAvailabilityMock from '../mocks/flightAvailabilityMock.json';

export interface FlightAvailabilityRequest {
  originDestinations: Array<{
    id: string;
    originLocationCode: string;
    destinationLocationCode: string;
    departureDateTime: {
      date: string;
      time: string;
    };
  }>;
  travelers: Array<{
    id: string;
    travelerType: string;
  }>;
  sources: string[];
}

export interface FlightAvailabilityResponse {
  data: any[];
  dictionaries?: any;
}

/**
 * Fetch flight availability from Amadeus API
 * Falls back to mock data if API fails
 */
export async function fetchFlightAvailability(
  request: FlightAvailabilityRequest
): Promise<FlightAvailabilityResponse> {
  try {
    // TODO: Implement actual API call with Amadeus credentials
    // For now, using mock data as fallback
    return flightAvailabilityMock as FlightAvailabilityResponse;
  } catch (error) {
    console.error('API request failed, using mock data:', error);
    return flightAvailabilityMock as FlightAvailabilityResponse;
  }
}

