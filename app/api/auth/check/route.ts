import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import fetch from 'node-fetch';

export async function GET() {
  try {
    const cookieStore = cookies();
    const sessionCookie = cookieStore.get('DHV_XC_SESSION');

    if (!sessionCookie) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Verify session with DHV-XC
    const response = await fetch('https://de.dhv-xc.de/api/v1/user', {
      headers: {
        Cookie: `DHV_XC_SESSION=${sessionCookie.value}`,
        'User-Agent': 'Paragliding-Dashboard/1.0',
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Session invalid' },
        { status: 401 }
      );
    }

    const userData = await response.json();
    return NextResponse.json({
      username: userData.username,
      authenticated: true,
    });
  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json(
      { error: 'Failed to verify authentication' },
      { status: 500 }
    );
  }
}