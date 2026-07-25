import { NextResponse, type NextRequest } from 'next/server';

import { ApiError, createCustomer, type CreateCustomerPayload } from '@dearbloom/shared';

const namePattern = /^[A-Za-z가-힣]{2,5}$/;

export async function POST(request: NextRequest) {
  const token = request.cookies.get('accessToken')?.value;
  if (!token) return errorResponse(401, '로그인이 필요합니다.');

  const payload = await getPayload(request);
  if (!payload) return errorResponse(400, '이름 또는 학교 정보가 올바르지 않습니다.');

  try {
    const result = await createCustomer(payload, { token });
    const response = NextResponse.json({ customer: result.customer });
    response.cookies.set('accessToken', result.accessToken, {
      httpOnly: true,
      path: '/',
      sameSite: 'lax',
      secure: request.nextUrl.protocol === 'https:',
    });

    return response;
  } catch (error) {
    if (error instanceof ApiError) {
      return errorResponse(error.status, error.message);
    }

    return errorResponse(502, '고객 정보를 저장하지 못했습니다.');
  }
}

async function getPayload(request: NextRequest): Promise<CreateCustomerPayload | undefined> {
  try {
    const body = (await request.json()) as { name?: unknown; universityId?: unknown };
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    const universityId = body.universityId;

    if (!namePattern.test(name)) return undefined;
    if (universityId !== undefined && (!Number.isInteger(universityId) || Number(universityId) <= 0)) {
      return undefined;
    }

    return { name, ...(universityId === undefined ? {} : { universityId: Number(universityId) }) };
  } catch {
    return undefined;
  }
}

function errorResponse(status: number, message: string) {
  return NextResponse.json({ message }, { status });
}
