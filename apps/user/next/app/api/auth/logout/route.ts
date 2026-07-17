import { NextResponse, type NextRequest } from 'next/server';

export function GET(request: NextRequest) {
  const response = NextResponse.redirect(new URL('/app', getPublicOrigin(request)));

  response.cookies.delete('accessToken');
  response.cookies.delete('refreshToken');

  return response;
}

function getPublicOrigin(request: NextRequest) {
  const forwardedHost = request.headers.get('x-forwarded-host');
  const host = forwardedHost ?? request.headers.get('host') ?? request.nextUrl.host;
  const forwardedProto = request.headers.get('x-forwarded-proto');
  const protocol = forwardedProto ?? request.nextUrl.protocol.replace(':', '');

  return `${protocol}://${host}`;
}
