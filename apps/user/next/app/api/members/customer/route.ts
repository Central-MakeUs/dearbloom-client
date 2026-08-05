import { NextResponse, type NextRequest } from 'next/server';

import { ApiError, createCustomer } from '@dearbloom/shared';

import { setAuthCookie, setOnboardingPendingCookie } from '@/src/lib/authCookies';

import { parseCustomerPayload } from './customerPayload';

export async function POST(request: NextRequest) {
  const token = request.cookies.get('accessToken')?.value;
  if (!token) return errorResponse(401, '로그인이 필요합니다.');

  const formSubmission = !request.headers.get('content-type')?.includes('application/json');
  const payload = await getPayload(request);
  if (!payload) return errorResponse(400, '이름, 학교 또는 지역 정보가 올바르지 않습니다.');

  try {
    const result = await createCustomer(payload, { token });
    const response = formSubmission
      ? new NextResponse(null, {
          headers: { Location: '/app/onboarding?completed=1' },
          status: 303,
        })
      : NextResponse.json({ customer: result.customer });
    setAuthCookie(request, response, 'accessToken', result.accessToken);
    setOnboardingPendingCookie(request, response, false);

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
    if (request.headers.get('content-type')?.includes('application/json')) {
      return parseCustomerPayload(await request.json());
    }

    const formData = await request.formData();
    const universityId = formData.get('universityId');

    return parseCustomerPayload({
      name: formData.get('name'),
      region: formData.get('region') || undefined,
      universityId: universityId ? Number(universityId) : undefined,
    });
  } catch {
    return undefined;
  }
}

function errorResponse(status: number, message: string) {
  return NextResponse.json({ message }, { status });
}
