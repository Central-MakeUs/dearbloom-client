import { NextResponse, type NextRequest } from 'next/server';

import {
  ApiError,
  registerDeviceToken,
  unregisterDeviceToken,
  type DevicePlatform,
} from '@dearbloom/shared';

/**
 * 디바이스 토큰 등록/해제 프록시 (httpOnly 쿠키 → Bearer).
 *
 * 토큰은 네이티브 셸이 Firebase 에서 받아 브릿지로 웹에 넘겨준 값입니다.
 * 웹에서는 accessToken 이 httpOnly 쿠키라 브라우저 JS 가 직접 백엔드를 부를 수 없어 이 라우트를 경유합니다.
 */
export async function POST(request: NextRequest) {
  const token = request.cookies.get('accessToken')?.value;
  if (!token) return errorResponse(401, '로그인이 필요합니다.');

  const payload = await getPayload(request);
  if (!payload) return errorResponse(400, '디바이스 토큰 정보가 올바르지 않습니다.');

  try {
    await registerDeviceToken(payload, { token });

    return NextResponse.json({ registered: true });
  } catch (error) {
    return apiErrorResponse(error, '디바이스 토큰을 등록하지 못했습니다.');
  }
}

export async function DELETE(request: NextRequest) {
  const token = request.cookies.get('accessToken')?.value;
  if (!token) return errorResponse(401, '로그인이 필요합니다.');

  const deviceToken = request.nextUrl.searchParams.get('token');
  if (!deviceToken) return errorResponse(400, 'token 파라미터가 필요합니다.');

  try {
    await unregisterDeviceToken(deviceToken, { token });

    return NextResponse.json({ registered: false });
  } catch (error) {
    return apiErrorResponse(error, '디바이스 토큰을 해제하지 못했습니다.');
  }
}

async function getPayload(request: NextRequest) {
  try {
    const body = (await request.json()) as { platform?: unknown; token?: unknown };
    const deviceToken = typeof body.token === 'string' ? body.token.trim() : '';
    const platform = body.platform;

    if (!deviceToken) return undefined;
    if (platform !== 'IOS' && platform !== 'ANDROID') return undefined;

    return { platform: platform as DevicePlatform, token: deviceToken };
  } catch {
    return undefined;
  }
}

function apiErrorResponse(error: unknown, fallback: string) {
  return error instanceof ApiError
    ? errorResponse(error.status, error.message)
    : errorResponse(502, fallback);
}

function errorResponse(status: number, message: string) {
  return NextResponse.json({ message }, { status });
}
