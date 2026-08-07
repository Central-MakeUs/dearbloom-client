import { NextResponse, type NextRequest } from 'next/server';

export function GET(request: NextRequest) {
  const hasSession = request.cookies.has('accessToken');
  const activeRole = request.cookies.get('activeRole')?.value;
  const destination = hasSession && activeRole === 'ARTIST' ? '/app/artist/dashboard' : '/snaps';

  return NextResponse.redirect(new URL(destination, request.url));
}
