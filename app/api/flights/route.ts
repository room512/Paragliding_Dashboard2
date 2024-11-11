import { NextResponse } from 'next/server';
import fetch from 'node-fetch';
import { cookies } from 'next/headers';
import { parseFlightData, ParseError } from '@/lib/flight-parser';
import { calculateStatistics } from '@/lib/flight-statistics';

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

    // Fetch flight data
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
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const html = await response.text();
    
    // Parse flight data
    const flights = parseFlightData(html);
    
    // Calculate statistics
    const statistics = calculateStatistics(flights);

    return NextResponse.json(statistics);
  } catch (error) {
    console.error('Flight data fetch error:', error);

    if (error instanceof ParseError) {
      return NextResponse.json(
        { error: 'Failed to parse flight data' },
        { status: 500 }
      );
    }

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