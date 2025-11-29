import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Check if the user has the auth cookie
  const hasAuth = request.cookies.get('promptos_auth');

  if (hasAuth?.value === 'authenticated') {
    return NextResponse.json({ authenticated: true });
  }

  // If no ACCESS_PASSWORD is set, everyone is authenticated
  if (!process.env.ACCESS_PASSWORD) {
    return NextResponse.json({ authenticated: true });
  }

  return NextResponse.json({ authenticated: false }, { status: 401 });
}
