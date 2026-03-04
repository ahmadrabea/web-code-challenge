export interface AvailabilityClass {
  numberOfBookableSeats: number;
  class: string;
}

export interface AirportInfo {
  iataCode: string;
  terminal?: string;
  at: string;
}

export interface Segment {
  departure: AirportInfo;
  arrival: AirportInfo;
  carrierCode: string;
  number: string;
  aircraft: { code: string };
  id: string;
  numberOfStops: number;
  blacklistedInEU: boolean;
  availabilityClasses: AvailabilityClass[];
}

export interface FlightAvailability {
  type: string;
  id: string;
  originDestinationId: string;
  source: string;
  instantTicketingRequired: boolean;
  paymentCardRequired: boolean;
  duration: string;
  segments: Segment[];
}

export interface LocationInfo {
  cityCode: string;
  countryCode: string;
}

export interface FlightAvailabilityResponse {
  meta?: { count: number };
  data: FlightAvailability[];
  dictionaries?: {
    locations: Record<string, LocationInfo>;
  };
}

export interface FlightAvailabilityRequest {
  originDestinations: Array<{
    id: string;
    originLocationCode: string;
    destinationLocationCode: string;
    departureDateTime: {
      date: string;
      time?: string;
    };
  }>;
  travelers: Array<{
    id: string;
    travelerType: string;
  }>;
  sources: string[];
}

export interface LocationSuggestion {
  label: string;
  iataCode: string;
  subType: string;
  cityName?: string;
  countryCode?: string;
}

export interface FlightRow {
  id: string;
  origin: string;
  destination: string;
  departure: string;
  arrival: string;
  duration: string;
  carrier: string;
  flightNumbers: string;
  aircraft: string;
  stops: string;
  availableSeats: string;
  source: string;
  [key: string]: string;
}
