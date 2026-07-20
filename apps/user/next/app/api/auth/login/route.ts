import { NextResponse, type NextRequest } from 'next/server';

import {
  createLocalOAuthAuthorizationUrl,
  createOAuthAuthorizationUrl,
  type OAuthProvider,
} from '@dearbloom/features-auth';

const fallbackApiBaseUrl = 'https://dev-api.dearbloom.co.kr';

export function GET(request: NextRequest) {
  const provider = getOAuthProvider(request.nextUrl.searchParams.get('provider'));

  if (!provider) {
    return NextResponse.redirect(new URL('/app?auth=invalid_provider', getPublicOrigin(request)));
  }

  const apiBaseUrl =
    process.env.NEXT_PUBLIC_OAUTH_API_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    fallbackApiBaseUrl;
  const authorizationUrl =
    provider === 'google' && process.env.NODE_ENV === 'development'
      ? createLocalOAuthAuthorizationUrl({
          baseUrl: apiBaseUrl,
          targetUrl:
            process.env.NEXT_PUBLIC_LOCAL_GOOGLE_CALLBACK_URL ??
            'http://localhost:3000/app/api/auth/callback',
        })
      : createOAuthAuthorizationUrl({ baseUrl: apiBaseUrl, provider });
  const response = NextResponse.redirect(authorizationUrl);

  response.cookies.set('oauthProvider', provider, {
    httpOnly: true,
    maxAge: 60 * 10,
    path: '/',
    sameSite: 'lax',
    secure: request.nextUrl.protocol === 'https:',
  });

  return response;
}

function getOAuthProvider(value: string | null): OAuthProvider | undefined {
  return value === 'apple' || value === 'google' ? value : undefined;
}

function getPublicOrigin(request: NextRequest) {
  const forwardedHost = request.headers.get('x-forwarded-host');
  const host = forwardedHost ?? request.headers.get('host') ?? request.nextUrl.host;
  const forwardedProto = request.headers.get('x-forwarded-proto');
  const protocol = forwardedProto ?? request.nextUrl.protocol.replace(':', '');

  return `${protocol}://${host}`;
}
