import { transformFlightData } from '../utils/flightDataTransformer';
import { FlightAvailabilityResponse } from '../types/flightTypes';
import mockData from '../mocks/flightAvailabilityMock.json';

describe('transformFlightData', () => {
  it('transforms mock API response into flat FlightRow array', () => {
    const rows = transformFlightData(mockData as unknown as FlightAvailabilityResponse);
    expect(rows.length).toBe(mockData.data.length);
  });

  it('extracts correct origin and destination from segments', () => {
    const rows = transformFlightData(mockData as unknown as FlightAvailabilityResponse);
    const first = rows[0];

    expect(first.origin).toBe('BOS');
    expect(first.destination).toBe('MAD');
  });

  it('produces correct flight numbers joined with arrow', () => {
    const rows = transformFlightData(mockData as unknown as FlightAvailabilityResponse);
    const first = rows[0];

    expect(first.flightNumbers).toBe('214 → 9931');
  });

  it('parses ISO duration correctly', () => {
    const rows = transformFlightData(mockData as unknown as FlightAvailabilityResponse);
    expect(rows[0].duration).toBe('10h 35m');
  });

  it('calculates stops including connections', () => {
    const rows = transformFlightData(mockData as unknown as FlightAvailabilityResponse);
    const first = rows[0];
    expect(first.stops).toBe('1');
  });

  it('returns maximum available seats', () => {
    const rows = transformFlightData(mockData as unknown as FlightAvailabilityResponse);
    const seats = Number(rows[0].availableSeats);
    expect(seats).toBeGreaterThan(0);
  });

  it('returns empty array for null/undefined/empty data', () => {
    expect(transformFlightData({ data: [] })).toEqual([]);
    expect(transformFlightData(null as any)).toEqual([]);
    expect(transformFlightData(undefined as any)).toEqual([]);
  });

  it('handles single-segment flights', () => {
    const singleSegment: FlightAvailabilityResponse = {
      data: [
        {
          type: 'flight-availability',
          id: '99',
          originDestinationId: '1',
          source: 'GDS',
          instantTicketingRequired: false,
          paymentCardRequired: false,
          duration: 'PT3H',
          segments: [
            {
              departure: { iataCode: 'JFK', at: '2026-06-01T08:00:00' },
              arrival: { iataCode: 'LAX', at: '2026-06-01T11:00:00' },
              carrierCode: 'AA',
              number: '100',
              aircraft: { code: '738' },
              id: '1',
              numberOfStops: 0,
              blacklistedInEU: false,
              availabilityClasses: [{ numberOfBookableSeats: 5, class: 'Y' }],
            },
          ],
        },
      ],
    };
    const rows = transformFlightData(singleSegment);
    expect(rows).toHaveLength(1);
    expect(rows[0].origin).toBe('JFK');
    expect(rows[0].destination).toBe('LAX');
    expect(rows[0].stops).toBe('0');
    expect(rows[0].flightNumbers).toBe('100');
    expect(rows[0].duration).toBe('3h');
  });

  it('all rows have required string fields', () => {
    const rows = transformFlightData(mockData as unknown as FlightAvailabilityResponse);
    const requiredKeys = [
      'id', 'origin', 'destination', 'departure', 'arrival',
      'duration', 'carrier', 'flightNumbers', 'aircraft',
      'stops', 'availableSeats', 'source',
    ];
    rows.forEach((row) => {
      requiredKeys.forEach((key) => {
        expect(typeof row[key]).toBe('string');
        expect(row[key].length).toBeGreaterThan(0);
      });
    });
  });
});
