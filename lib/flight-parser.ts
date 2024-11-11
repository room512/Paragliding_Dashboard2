import { FlightData } from '@/types/flight';

export class ParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ParseError';
  }
}

export function parseFlightData(html: string): FlightData[] {
  try {
    const flights: FlightData[] = [];
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const flightRows = doc.querySelectorAll('table.flights-table tr[data-flight-id]');

    flightRows.forEach((row) => {
      const flight: FlightData = {
        id: row.getAttribute('data-flight-id') || '',
        date: row.querySelector('.flight-date')?.textContent?.trim() || '',
        takeoff: row.querySelector('.takeoff')?.textContent?.trim() || '',
        landing: row.querySelector('.landing')?.textContent?.trim() || '',
        duration: row.querySelector('.duration')?.textContent?.trim() || '',
        distance: parseFloat(row.querySelector('.distance')?.textContent?.trim() || '0'),
        points: parseFloat(row.querySelector('.points')?.textContent?.trim() || '0'),
        glider: row.querySelector('.glider')?.textContent?.trim() || '',
      };
      flights.push(flight);
    });

    if (flights.length === 0) {
      throw new ParseError('No flight data found in the HTML response');
    }

    return flights;
  } catch (error) {
    if (error instanceof ParseError) {
      throw error;
    }
    throw new ParseError('Failed to parse flight data from HTML');
  }
}