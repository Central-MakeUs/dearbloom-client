import { NextResponse, type NextRequest } from 'next/server';

import {
  createLocalOAuthAuthorizationUrl,
  createOAuthAuthorizationUrl,
  type AuthRole,
  type OAuthProvider,
} from '@dearbloom/features-auth';

const fallbackApiBaseUrl = 'https://dev-api.dearbloom.co.kr';

export function GET(request: NextRequest) {
  const provider = getOAuthProvider(request.nextUrl.searchParams.get('provider'));
  const role = getAuthRole(request.nextUrl.searchParams.get('role'));

  if (!provider || !role) {
    const reason = provider ? 'invalid_role' : 'invalid_provider';
    return NextResponse.redirect(new URL(`/app/login?auth=${reason}`, getPublicOrigin(request)));
  }

  const apiBaseUrl =
    process.env.NEXT_PUBLIC_OAUTH_API_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    fallbackApiBaseUrl;
  const authorizationUrl =
    provider === 'google' && process.env.NODE_ENV === 'development'
      ? createLocalOAuthAuthorizationUrl({
          baseUrl: apiBaseUrl,
          targetUrl: addRoleToCallbackUrl(
            process.env.NEXT_PUBLIC_LOCAL_GOOGLE_CALLBACK_URL ??
              'http://localhost:3000/app/api/auth/callback',
            role,
          ),
        })
      : createOAuthAuthorizationUrl({ baseUrl: apiBaseUrl, provider, role });
  const response = NextResponse.redirect(authorizationUrl);

  response.cookies.set('oauthProvider', provider, {
    httpOnly: true,
    maxAge: 60 * 10,
    path: '/',
    sameSite: 'lax',
    secure: request.nextUrl.protocol === 'https:',
  });
  response.cookies.set('oauthRole', role, {
    httpOnly: true,
    maxAge: 60 * 10,
    path: '/',
    sameSite: 'lax',
    secure: request.nextUrl.protocol === 'https:',
  });

  return response;
}

function getAuthRole(value: string | null): AuthRole | undefined {
  return value === 'ARTIST' || value === 'CUSTOMER' ? value : undefined;
}

function addRoleToCallbackUrl(callbackUrl: string, role: AuthRole) {
  const url = new URL(callbackUrl);
  url.searchParams.set('role', role);

  return url.toString();
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
