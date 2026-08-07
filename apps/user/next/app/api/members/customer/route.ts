import { NextResponse, type NextRequest } from 'next/server';

import { ApiError, createCustomer } from '@dearbloom/shared';

import { setAuthCookie } from '@/src/lib/authCookies';

import { parseCustomerPayload } from './customerPayload';

export async function POST(request: NextRequest) {
  const token = request.cookies.get('accessToken')?.value;
  if (!token) return errorResponse(401, '로그인이 필요합니다.');

  const payload = await getPayload(request);
  if (!payload) return errorResponse(400, '이름, 학교 또는 지역 정보가 올바르지 않습니다.');

  try {
    const result = await createCustomer(payload, { token });
    const response = NextResponse.json({ customer: result.customer });
    setAuthCookie(request, response, 'accessToken', result.accessToken);

    return response;
  } catch (error) {
    if (error instanceof ApiError) {
      return errorResponse(error.status, error.message);
    }

    return errorResponse(502, '고객 정보를 저장하지 못했습니다.');
  }
}

async function getPayload(request: NextRequest) {
  try {
    return parseCustomerPayload(await request.json());
  } catch {
    return undefined;
  }
}

function errorResponse(status: number, message: string) {
  return NextResponse.json({ message }, { status });
}
