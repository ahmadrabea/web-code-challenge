import { FlightAvailability, FlightAvailabilityResponse, FlightRow } from '../types/flightTypes';

function parseIsoDuration(iso: string): string {
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
  if (!match) return iso;
  const hours = match[1] ? `${match[1]}h` : '';
  const minutes = match[2] ? ` ${match[2]}m` : '';
  return `${hours}${minutes}`.trim();
}

function formatDateTime(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

function getMaxSeats(flight: FlightAvailability): number {
  let max = 0;
  for (const segment of flight.segments) {
    for (const ac of segment.availabilityClasses) {
      if (ac.numberOfBookableSeats > max) {
        max = ac.numberOfBookableSeats;
      }
    }
  }
  return max;
}

function getTotalStops(flight: FlightAvailability): number {
  const segmentStops = flight.segments.reduce((sum, seg) => sum + seg.numberOfStops, 0);
  const connections = Math.max(0, flight.segments.length - 1);
  return segmentStops + connections;
}

export function transformFlightData(
  response: FlightAvailabilityResponse,
  airportNames: Record<string, string> = {},
): FlightRow[] {
  if (!response?.data?.length) return [];

  const formatAirport = (iataCode: string) => {
    const name = airportNames[iataCode];
    return name ? `${iataCode} — ${name}` : iataCode;
  };

  return response.data.map((flight) => {
    const firstSegment = flight.segments[0];
    const lastSegment = flight.segments[flight.segments.length - 1];

    return {
      id: flight.id,
      origin: formatAirport(firstSegment.departure.iataCode),
      destination: formatAirport(lastSegment.arrival.iataCode),
      departure: formatDateTime(firstSegment.departure.at),
      arrival: formatDateTime(lastSegment.arrival.at),
      duration: parseIsoDuration(flight.duration),
      carrier: firstSegment.carrierCode,
      flightNumbers: flight.segments.map((s) => s.number).join(' → '),
      aircraft: flight.segments.map((s) => s.aircraft.code).join(', '),
      stops: String(getTotalStops(flight)),
      availableSeats: String(getMaxSeats(flight)),
      source: flight.source,
    };
  });
}
