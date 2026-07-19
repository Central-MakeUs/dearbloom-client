import { NextResponse, type NextRequest } from 'next/server';

import type { OAuthProvider } from '@dearbloom/features-auth';

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
const homePath = '/app';

export async function GET(request: NextRequest) {
  const provider = getOAuthProvider(request.cookies.get('oauthProvider')?.value);
  const oneTimeCode =
    request.nextUrl.searchParams.get('oneTimeCode') ??
    request.nextUrl.searchParams.get('one_time_code');

  if (!oneTimeCode) {
    return redirectHome(
      request,
      isLocalRequest(request) ? 'missing_one_time_code' : 'success',
      provider,
    );
  }

  const tokenExchangeResult = await exchangeOneTimeCode(oneTimeCode);

  if (!tokenExchangeResult.ok) {
    return redirectHome(request, tokenExchangeResult.reason, provider);
  }

  const response = redirectHome(request, 'success', provider);
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

function redirectHome(
  request: NextRequest,
  authStatus: string,
  provider?: OAuthProvider,
) {
  const homeUrl = new URL(homePath, getPublicOrigin(request));
  homeUrl.searchParams.set('auth', authStatus);
  if (provider) {
    homeUrl.searchParams.set('provider', provider);
  }

  const response = NextResponse.redirect(homeUrl);
  response.cookies.set('oauthProvider', '', {
    expires: new Date(0),
    maxAge: 0,
    path: '/',
  });

  return response;
}

function getOAuthProvider(value?: string): OAuthProvider | undefined {
  return value === 'apple' || value === 'google' ? value : undefined;
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
