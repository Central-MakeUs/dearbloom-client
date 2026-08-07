import { NextResponse, type NextRequest } from 'next/server';

export function GET(request: NextRequest) {
  const hasSession = request.cookies.has('accessToken');
  const activeRole = request.cookies.get('activeRole')?.value;
  const destination = hasSession && activeRole === 'ARTIST' ? '/app/artist/dashboard' : '/snaps';

  return NextResponse.redirect(new URL(destination, getPublicOrigin(request)));
}

function getPublicOrigin(request: NextRequest) {
  const host = request.headers.get('x-forwarded-host') ?? request.headers.get('host') ?? request.nextUrl.host;
  const protocol =
    request.headers.get('x-forwarded-proto') ?? request.nextUrl.protocol.replace(':', '');

  return `${protocol}://${host}`;
}
