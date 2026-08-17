import { defineMiddleware } from 'astro:middleware';

import { logoutMember, refreshMemberToken, type MemberRole } from '@dearbloom/shared';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? process.env.PUBLIC_API_URL;
const isProduction = apiBaseUrl?.replace(/\/$/, '') === 'https://api.dearbloom.co.kr';
const accessTokenMaxAge = isProduction ? 1_800 : 10_800;

export const onRequest = defineMiddleware(async (context, next) => {
  if (context.cookies.has('onboardingPending')) {
    const token = context.cookies.get('accessToken')?.value;
    if (token) await logoutMember({ token }).catch(() => undefined);
    const response = context.url.pathname.startsWith('/api/')
      ? new Response(JSON.stringify({ error: 'unauthorized' }), {
          headers: { 'Content-Type': 'application/json' },
          status: 401,
        })
      : await next();
    expireAuthCookies(context.request, response);
    return response;
  }

  if (context.cookies.has('accessToken') || context.url.pathname.startsWith('/_astro/')) {
    return next();
  }

  const refreshToken = context.cookies.get('refreshToken')?.value;
  const role = getMemberRole(context.cookies.get('activeRole')?.value);
  if (!refreshToken || !role) return next();

  try {
    const tokens = await refreshMemberToken({ refreshToken, role });
    context.cookies.set('accessToken', tokens.accessToken, {
      ...getCookieScope(context.request),
      httpOnly: true,
      maxAge: accessTokenMaxAge,
      path: '/',
      sameSite: 'lax',
    });
  } catch {
    const scope = getCookieScope(context.request);
    context.cookies.delete('accessToken', { ...scope, path: '/' });
    context.cookies.delete('refreshToken', { ...scope, path: '/' });
    context.cookies.delete('activeRole', { ...scope, path: '/' });
  }

  return next();
});

function expireAuthCookies(request: Request, response: Response) {
  const scope = getCookieScope(request);
  const secure = scope.secure ? '; Secure' : '';
  for (const name of ['accessToken', 'refreshToken', 'activeRole', 'onboardingPending']) {
    const expiredCookie = `${name}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Max-Age=0; HttpOnly; SameSite=Lax`;
    response.headers.append('Set-Cookie', `${expiredCookie}${secure}`);
    if ('domain' in scope) {
      response.headers.append('Set-Cookie', `${expiredCookie}; Domain=.dearbloom.co.kr; Secure`);
    }
  }
}

function getMemberRole(value?: string): MemberRole | undefined {
  return value === 'CUSTOMER' || value === 'ARTIST' ? value : undefined;
}

function getCookieScope(request: Request) {
  const requestUrl = new URL(request.url);
  const forwardedHost = request.headers.get('x-forwarded-host')?.split(',')[0]?.trim();
  const hostname = (forwardedHost?.split(':')[0] ?? requestUrl.hostname).toLowerCase();
  const forwardedProtocol = request.headers.get('x-forwarded-proto')?.split(',')[0]?.trim();
  const isDearBloomHost = hostname === 'dearbloom.co.kr' || hostname.endsWith('.dearbloom.co.kr');
  return {
    secure:
      isDearBloomHost || (forwardedProtocol ?? requestUrl.protocol.replace(':', '')) === 'https',
    ...(isDearBloomHost ? { domain: '.dearbloom.co.kr' } : {}),
  };
}
