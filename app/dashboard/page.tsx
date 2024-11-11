'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LogOut, Plane, AlertCircle, RefreshCcw } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { FlightStatistics } from '@/types/flight';
import { useAuth } from '@/contexts/auth-context';
import { format, parseISO } from 'date-fns';

export default function DashboardPage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<FlightStatistics | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/');
      return;
    }
    fetchFlightData();
  }, [user, router]);

  const fetchFlightData = async () => {
    try {
      setError(null);
      setRefreshing(true);
      const response = await fetch('/api/scrape-flights');
      
      if (!response.ok) {
        if (response.status === 401) {
          router.push('/');
          return;
        }
        throw new Error('Failed to fetch flight data');
      }
      
      const data = await response.json();
      setStats(data.statistics);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch flight data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const prepareChartData = () => {
    if (!stats) return [];
    return Object.entries(stats.flightsByMonth).map(([month, count]) => ({
      month,
      flights: count,
      distance: stats.recentFlights
        .filter(f => format(parseISO(f.date), 'MMM yyyy') === month)
        .reduce((sum, f) => sum + f.distance, 0),
      hours: stats.recentFlights
        .filter(f => format(parseISO(f.date), 'MMM yyyy') === month)
        .reduce((sum, f) => {
          const [hours, minutes] = f.duration.split(':').map(Number);
          return sum + hours + minutes / 60;
        }, 0),
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-100 to-sky-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <Plane className="h-6 w-6 text-sky-600" />
              <h1 className="text-xl font-semibold text-gray-900">
                Paragliding Dashboard
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={fetchFlightData}
                disabled={refreshing}
                className="flex items-center space-x-2"
              >
                <RefreshCcw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </Button>
              <span className="text-sm text-gray-600">
                Welcome, {user?.username}
              </span>
              <Button
                variant="ghost"
                onClick={logout}
                className="flex items-center space-x-2"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Total Flights</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <p className="text-3xl font-bold text-sky-600">
                  {stats?.totalFlights || 0}
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Total Distance</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <p className="text-3xl font-bold text-sky-600">
                  {stats?.totalDistance?.toFixed(1) || 0} km
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Best Score</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <p className="text-3xl font-bold text-sky-600">
                  {stats?.bestScore?.toFixed(1) || 0} pts
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Flights per Month</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
              {loading ? (
                <Skeleton className="w-full h-full" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={prepareChartData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="flights" fill="#0284c7" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Distance per Month</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
              {loading ? (
                <Skeleton className="w-full h-full" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={prepareChartData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="distance" fill="#0369a1" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Flights</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {stats?.recentFlights.map((flight) => (
                  <div
                    key={flight.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div>
                      <p className="font-medium">{flight.takeoff}</p>
                      <p className="text-sm text-gray-500">{flight.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{flight.distance} km</p>
                      <p className="text-sm text-gray-500">
                        {flight.duration}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}