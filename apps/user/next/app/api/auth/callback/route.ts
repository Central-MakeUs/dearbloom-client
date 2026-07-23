import { NextResponse, type NextRequest } from 'next/server';

import type { AuthRole } from '@dearbloom/features-auth';
import { getMemberMe } from '@dearbloom/shared';

type LocalTokenExchangeResponse = {
  accessToken?: string;
  refreshToken?: string;
  access_token?: string;
  refresh_token?: string;
  data?: LocalTokenExchangeResponse;
  result?: LocalTokenExchangeResponse;
  tokens?: LocalTokenExchangeResponse;
};

type ExtractedTokens = {
  accessToken?: string;
  refreshToken?: string;
};

const fallbackApiBaseUrl = 'https://dev-api.dearbloom.co.kr';

export async function GET(request: NextRequest) {
  const role =
    getAuthRole(request.nextUrl.searchParams.get('role')) ??
    getAuthRole(request.cookies.get('oauthRole')?.value);
  const needsOnboarding = getBoolean(request.nextUrl.searchParams.get('needsOnboarding'));
  const oneTimeCode =
    request.nextUrl.searchParams.get('oneTimeCode') ??
    request.nextUrl.searchParams.get('one_time_code');

  if (!oneTimeCode) {
    if (isLocalRequest(request)) {
      return redirectLoginError(request, 'missing_one_time_code', role);
    }

    return redirectAfterLogin(request, role, needsOnboarding);
  }

  const tokenExchangeResult = await exchangeOneTimeCode(oneTimeCode);

  if (!tokenExchangeResult.ok) {
    return redirectLoginError(request, tokenExchangeResult.reason, role);
  }

  const localNeedsOnboarding =
    needsOnboarding ??
    (role ? await getLocalOnboardingState(tokenExchangeResult.tokens.accessToken, role) : undefined);
  const response = redirectAfterLogin(request, role, localNeedsOnboarding);
  const cookieOptions = {
    httpOnly: true,
    path: '/',
    sameSite: 'lax' as const,
    secure: request.nextUrl.protocol === 'https:',
  };

  response.cookies.set('accessToken', tokenExchangeResult.tokens.accessToken, cookieOptions);
  response.cookies.set('refreshToken', tokenExchangeResult.tokens.refreshToken, cookieOptions);

  return response;
}

async function exchangeOneTimeCode(oneTimeCode: string) {
  const apiBaseUrl = normalizeBaseUrl(
    process.env.NEXT_PUBLIC_OAUTH_API_URL ??
      process.env.NEXT_PUBLIC_API_URL ??
      fallbackApiBaseUrl,
  );

  try {
    const response = await fetch(`${apiBaseUrl}/oauth2/local/exchange`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ oneTimeCode }),
      cache: 'no-store',
    });

    if (!response.ok) {
      return { ok: false as const, reason: `exchange_${response.status}` };
    }

    const body = (await response.json()) as LocalTokenExchangeResponse;
    const tokens = extractTokens(body);

    if (!tokens.accessToken || !tokens.refreshToken) {
      return { ok: false as const, reason: 'missing_tokens_in_exchange_response' };
    }

    return {
      ok: true as const,
      tokens: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      },
    };
  } catch {
    return { ok: false as const, reason: 'exchange_request_failed' };
  }
}

function extractTokens(body: LocalTokenExchangeResponse): ExtractedTokens {
  const nestedBody = body.data ?? body.result ?? body.tokens ?? body;

  return {
    accessToken: nestedBody.accessToken ?? nestedBody.access_token,
    refreshToken: nestedBody.refreshToken ?? nestedBody.refresh_token,
  };
}

async function getLocalOnboardingState(accessToken: string, role: AuthRole) {
  try {
    const member = await getMemberMe({ token: accessToken });

    return role === 'CUSTOMER' ? !member.hasCustomer : !member.hasArtist;
  } catch {
    return undefined;
  }
}

function redirectAfterLogin(
  request: NextRequest,
  role?: AuthRole,
  needsOnboarding?: boolean,
) {
  if (!role || needsOnboarding === undefined) {
    return redirectLoginError(request, 'missing_onboarding_state', role);
  }

  const destination =
    role === 'CUSTOMER'
      ? needsOnboarding
        ? '/app/onboarding'
        : '/snaps'
      : needsOnboarding
        ? '/app/onboarding/artist'
        : '/app/artist/dashboard';

  return clearOAuthCookies(NextResponse.redirect(new URL(destination, getPublicOrigin(request))));
}

function redirectLoginError(request: NextRequest, reason: string, role?: AuthRole) {
  const url = new URL('/app/login', getPublicOrigin(request));
  url.searchParams.set('auth', reason);
  if (role) url.searchParams.set('role', role);

  return clearOAuthCookies(NextResponse.redirect(url));
}

function clearOAuthCookies(response: NextResponse) {
  response.cookies.set('oauthProvider', '', {
    expires: new Date(0),
    maxAge: 0,
    path: '/',
  });
  response.cookies.set('oauthRole', '', {
    expires: new Date(0),
    maxAge: 0,
    path: '/',
  });

  return response;
}

function getAuthRole(value?: string | null): AuthRole | undefined {
  return value === 'ARTIST' || value === 'CUSTOMER' ? value : undefined;
}

function getBoolean(value: string | null): boolean | undefined {
  return value === 'true' ? true : value === 'false' ? false : undefined;
}

function getPublicOrigin(request: NextRequest) {
  const forwardedHost = request.headers.get('x-forwarded-host');
  const host = forwardedHost ?? request.headers.get('host') ?? request.nextUrl.host;
  const forwardedProto = request.headers.get('x-forwarded-proto');
  const protocol = forwardedProto ?? request.nextUrl.protocol.replace(':', '');

  return `${protocol}://${host}`;
}

function isLocalRequest(request: NextRequest) {
  const host = request.headers.get('x-forwarded-host') ?? request.headers.get('host') ?? request.nextUrl.host;

  return host.startsWith('localhost') || host.startsWith('127.0.0.1');
}

function normalizeBaseUrl(baseUrl: string) {
  return baseUrl.replace(/\/$/, '');
}
