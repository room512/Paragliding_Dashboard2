export interface FlightData {
  id: string;
  date: string;
  takeoff: string;
  landing: string;
  duration: string;
  distance: number;
  points: number;
  glider: string;
}

export interface FlightStatistics {
  totalFlights: number;
  totalDistance: number;
  totalPoints: number;
  averageDistance: number;
  longestFlight: number;
  bestScore: number;
  flightsByMonth: Record<string, number>;
  recentFlights: FlightData[];
}