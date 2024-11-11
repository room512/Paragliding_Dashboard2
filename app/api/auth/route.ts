import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import fetch from 'node-fetch';
import { z } from 'zod';

const authSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    // Validate request body
    const body = await request.json();
    const result = authSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }

    const { username, password } = result.data;

    // Call DHV-XC API
    const response = await fetch('https://de.dhv-xc.de/api/v1/authcheck', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Paragliding-Dashboard/1.0',
      },
      body: JSON.stringify({
        user: username,
        pass: password,
      }),
    });

    const data = await response.json();

    // Handle authentication failure
    if (!response.ok || data.error) {
      return NextResponse.json(
        { error: data.error || 'Authentication failed' },
        { status: 401 }
      );
    }

    // Get session cookie from response headers
    const setCookieHeader = response.headers.get('set-cookie');
    if (!setCookieHeader) {
      return NextResponse.json(
        { error: 'No session cookie received' },
        { status: 500 }
      );
    }

    // Parse session cookie
    const sessionCookie = setCookieHeader
      .split(';')[0]
      .split('=')
      .slice(1)
      .join('=');

    // Create response with session cookie
    const nextResponse = NextResponse.json(
      { success: true, message: 'Authentication successful' },
      { status: 200 }
    );

    // Set secure cookie with session data
    cookies().set('DHV_XC_SESSION', sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      // Session cookie expires when browser closes
    });

    return nextResponse;
  } catch (error) {
    console.error('Authentication error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request format' },
        { status: 400 }
      );
    }

    if (error instanceof Error) {
      return NextResponse.json(
        { error: 'Failed to authenticate' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}