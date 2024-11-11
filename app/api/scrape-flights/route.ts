import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import fetch from 'node-fetch';
import * as cheerio from 'cheerio';
import { FlightData } from '@/types/flight';
import { calculateStatistics } from '@/lib/flight-statistics';

async function scrapeFlights(html: string): Promise<FlightData[]> {
  const $ = cheerio.load(html);
  const flights: FlightData[] = [];

  $('.flights-table tbody tr').each((_, element) => {
    const $row = $(element);
    
    // Skip header rows or rows without flight data
    if (!$row.attr('data-flight-id')) return;

    const flight: FlightData = {
      id: $row.attr('data-flight-id') || '',
      date: $row.find('.flight-date').text().trim(),
      takeoff: $row.find('.takeoff').text().trim(),
      landing: $row.find('.landing').text().trim(),
      duration: $row.find('.duration').text().trim(),
      distance: parseFloat($row.find('.distance').text().trim()) || 0,
      points: parseFloat($row.find('.points').text().trim()) || 0,
      glider: $row.find('.glider').text().trim(),
    };

    flights.push(flight);
  });

  return flights;
}

export async function GET() {
  try {
    // Get authentication cookie
    const cookieStore = cookies();
    const sessionCookie = cookieStore.get('DHV_XC_SESSION');

    if (!sessionCookie) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Fetch flight data from DHV-XC
    const response = await fetch('https://de.dhv-xc.de/flights/my', {
      headers: {
        Cookie: `DHV_XC_SESSION=${sessionCookie.value}`,
        'User-Agent': 'Paragliding-Dashboard/1.0',
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        return NextResponse.json(
          { error: 'Session expired' },
          { status: 401 }
        );
      }
      throw new Error(`Failed to fetch flights: ${response.statusText}`);
    }

    const html = await response.text();
    
    // Scrape and parse flight data
    const flights = await scrapeFlights(html);
    
    if (flights.length === 0) {
      return NextResponse.json(
        { error: 'No flights found' },
        { status: 404 }
      );
    }

    // Calculate statistics from flight data
    const statistics = calculateStatistics(flights);

    return NextResponse.json({
      statistics,
      flights,
    });

  } catch (error) {
    console.error('Flight scraping error:', error);

    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}