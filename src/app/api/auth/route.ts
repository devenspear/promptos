import { NextRequest, NextResponse } from 'next/server';

// Secondary access password
const SECONDARY_PASSWORD = 'Pa$$2025';

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();
    const primaryPassword = process.env.ACCESS_PASSWORD;

    if (!primaryPassword) {
      // If no primary password is set, allow access
      return NextResponse.json({ success: true });
    }

    // Accept either the primary password OR the secondary password
    if (password === primaryPassword || password === SECONDARY_PASSWORD) {
      const response = NextResponse.json({ success: true });
      response.cookies.set('promptos_auth', 'authenticated', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });
      return response;
    }

    return NextResponse.json({ success: false, error: 'Invalid password' }, { status: 401 });
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid request' }, { status: 400 });
  }
}
