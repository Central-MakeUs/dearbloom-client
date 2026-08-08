import assert from 'node:assert/strict';
import test from 'node:test';

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server.js';

import {
  getAuthCookieMaxAge,
  getAuthCookieOptions,
  getTokenActiveRole,
  setAuthCookie,
} from './authCookies.ts';

function token(activeRole: 'CUSTOMER' | 'ARTIST' = 'CUSTOMER') {
  return `header.${Buffer.from(JSON.stringify({ activeRole })).toString('base64url')}.signature`;
}

function request(
  host: string,
  protocol: 'http:' | 'https:',
  forwardedProtocol?: string,
  forwardedHost?: string,
) {
  return {
    headers: new Headers({
      host,
      ...(forwardedHost ? { 'x-forwarded-host': forwardedHost } : {}),
      ...(forwardedProtocol ? { 'x-forwarded-proto': forwardedProtocol } : {}),
    }),
    nextUrl: { hostname: host.split(':')[0], protocol },
  } as NextRequest;
}

test('dearbloom subdomains replace host-only cookies', () => {
  const dearBloomRequest = request(
    'user-next.vercel.app',
    'https:',
    'https',
    'dev.dearbloom.co.kr',
  );
  const options = getAuthCookieOptions(dearBloomRequest, 3600);
  const response = NextResponse.json({});

  setAuthCookie(dearBloomRequest, response, 'accessToken', token());

  const setCookies = response.headers.getSetCookie();
  assert.equal(options.domain, '.dearbloom.co.kr');
  assert.equal(options.secure, true);
  assert.equal(options.maxAge, 3600);
  assert.equal(setCookies.length, 4);
  assert.equal(setCookies.filter((cookie) => cookie.includes('Domain=.dearbloom.co.kr')).length, 2);
  assert.equal(setCookies.filter((cookie) => !cookie.includes('Domain=')).length, 2);
});

test('dearbloom root replaces stale host-only cookies', () => {
  const dearBloomRequest = request('dearbloom.co.kr', 'https:');
  const response = NextResponse.json({});

  setAuthCookie(dearBloomRequest, response, 'accessToken', token());

  const setCookies = response.headers.getSetCookie();
  assert.equal(setCookies.length, 4);
  assert.equal(
    setCookies.filter(
      (cookie) => cookie.includes('Domain=.dearbloom.co.kr') && !cookie.includes('Max-Age=0'),
    ).length,
    2,
  );
  assert.equal(
    setCookies.filter((cookie) => !cookie.includes('Domain=') && cookie.includes('Max-Age=0'))
      .length,
    2,
  );
});

test('local and tunnel hosts keep host-only cookies', () => {
  const local = getAuthCookieOptions(request('localhost:3000', 'http:'), 3600);
  const tunnel = getAuthCookieOptions(request('example.trycloudflare.com', 'http:', 'https'), 3600);

  assert.equal('domain' in local, false);
  assert.equal(local.secure, false);
  assert.equal('domain' in tunnel, false);
  assert.equal(tunnel.secure, true);
});

test('cookie lifetime follows fixed backend settings by environment', () => {
  assert.equal(getAuthCookieMaxAge('accessToken', 'https://dev-api.dearbloom.co.kr'), 10_800);
  assert.equal(getAuthCookieMaxAge('refreshToken', 'https://dev-api.dearbloom.co.kr'), 604_800);
  assert.equal(getAuthCookieMaxAge('accessToken', 'https://api.dearbloom.co.kr'), 1_800);
  assert.equal(getAuthCookieMaxAge('accessToken', 'https://api.dearbloom.co.kr/'), 1_800);
  assert.equal(getAuthCookieMaxAge('refreshToken', 'https://api.dearbloom.co.kr'), 2_592_000);
  assert.equal(getAuthCookieMaxAge('activeRole', 'https://api.dearbloom.co.kr'), 2_592_000);
});

test('active role is preserved separately for access token refresh', () => {
  assert.equal(getTokenActiveRole(token('ARTIST')), 'ARTIST');
  assert.equal(getTokenActiveRole('not-a-jwt'), undefined);
});
