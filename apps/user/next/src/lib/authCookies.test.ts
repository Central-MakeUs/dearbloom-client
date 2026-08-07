import assert from 'node:assert/strict';
import test from 'node:test';

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server.js';

import {
  getAuthCookieOptions,
  getTokenMaxAge,
  setAuthCookie,
} from './authCookies.ts';

function token(exp: number) {
  return `header.${Buffer.from(JSON.stringify({ exp })).toString('base64url')}.signature`;
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

  setAuthCookie(dearBloomRequest, response, 'accessToken', token(Math.floor(Date.now() / 1000) + 3600));

  assert.equal(options.domain, '.dearbloom.co.kr');
  assert.equal(options.secure, true);
  assert.equal(options.maxAge, 3600);
  assert.equal(response.headers.getSetCookie().length, 2);
  assert.match(response.headers.getSetCookie()[0] ?? '', /Domain=.dearbloom.co.kr/);
  assert.doesNotMatch(response.headers.getSetCookie()[1] ?? '', /Domain=/);
});

test('dearbloom root replaces stale host-only cookies', () => {
  const dearBloomRequest = request('dearbloom.co.kr', 'https:');
  const response = NextResponse.json({});

  setAuthCookie(dearBloomRequest, response, 'accessToken', token(Math.floor(Date.now() / 1000) + 3600));

  assert.equal(response.headers.getSetCookie().length, 2);
  assert.match(response.headers.getSetCookie()[0] ?? '', /Domain=.dearbloom.co.kr/);
  assert.doesNotMatch(response.headers.getSetCookie()[0] ?? '', /Max-Age=0/);
  assert.doesNotMatch(response.headers.getSetCookie()[1] ?? '', /Domain=/);
  assert.match(response.headers.getSetCookie()[1] ?? '', /Max-Age=0/);
});

test('local and tunnel hosts keep host-only cookies', () => {
  const local = getAuthCookieOptions(request('localhost:3000', 'http:'), 3600);
  const tunnel = getAuthCookieOptions(request('example.trycloudflare.com', 'http:', 'https'), 3600);

  assert.equal('domain' in local, false);
  assert.equal(local.secure, false);
  assert.equal('domain' in tunnel, false);
  assert.equal(tunnel.secure, true);
});

test('cookie lifetime follows JWT exp across environments', () => {
  assert.equal(getTokenMaxAge(token(20_800), 10_000), 10_800);
  assert.equal(getTokenMaxAge(token(2_602_000), 10_000), 2_592_000);
  assert.equal(getTokenMaxAge('not-a-jwt', 10_000), undefined);
});
