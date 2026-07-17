import { NextResponse, type NextRequest } from 'next/server';

export function GET(request: NextRequest) {
  const response = NextResponse.redirect(new URL('/app', request.url));

  response.cookies.delete('accessToken');
  response.cookies.delete('refreshToken');

  return response;
}
