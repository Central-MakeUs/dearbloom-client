import { NextResponse, type NextRequest } from 'next/server';

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
  const oneTimeCode =
    request.nextUrl.searchParams.get('oneTimeCode') ??
    request.nextUrl.searchParams.get('one_time_code') ??
    request.nextUrl.searchParams.get('code');

  if (!oneTimeCode) {
    return redirectHome(request, 'missing_one_time_code');
  }

  const tokenExchangeResult = await exchangeOneTimeCode(oneTimeCode);

  if (!tokenExchangeResult.ok) {
    return redirectHome(request, tokenExchangeResult.reason);
  }

  const response = redirectHome(request, 'success');
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

function redirectHome(request: NextRequest, authStatus: string) {
  const homeUrl = new URL(homePath, getPublicOrigin(request));
  homeUrl.searchParams.set('auth', authStatus);

  return NextResponse.redirect(homeUrl);
}

function getPublicOrigin(request: NextRequest) {
  const forwardedHost = request.headers.get('x-forwarded-host');
  const host = forwardedHost ?? request.headers.get('host') ?? request.nextUrl.host;
  const forwardedProto = request.headers.get('x-forwarded-proto');
  const protocol = forwardedProto ?? request.nextUrl.protocol.replace(':', '');

  return `${protocol}://${host}`;
}

function normalizeBaseUrl(baseUrl: string) {
  return baseUrl.replace(/\/$/, '');
}
