import { FlightData, FlightStatistics } from '@/types/flight';
import { format, parseISO } from 'date-fns';

export function calculateStatistics(flights: FlightData[]): FlightStatistics {
  const totalFlights = flights.length;
  const totalDistance = flights.reduce((sum, flight) => sum + flight.distance, 0);
  const totalPoints = flights.reduce((sum, flight) => sum + flight.points, 0);
  const averageDistance = totalDistance / totalFlights;
  const longestFlight = Math.max(...flights.map(flight => flight.distance));
  const bestScore = Math.max(...flights.map(flight => flight.points));

  // Calculate flights by month
  const flightsByMonth: Record<string, number> = {};
  flights.forEach(flight => {
    const month = format(parseISO(flight.date), 'MMM yyyy');
    flightsByMonth[month] = (flightsByMonth[month] || 0) + 1;
  });

  // Get most recent flights
  const recentFlights = [...flights]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  return {
    totalFlights,
    totalDistance,
    totalPoints,
    averageDistance,
    longestFlight,
    bestScore,
    flightsByMonth,
    recentFlights,
  };
}