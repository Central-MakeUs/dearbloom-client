import { NextResponse, type NextRequest } from 'next/server';
import { ApiError, withdrawMember } from '@dearbloom/shared';

export async function DELETE(request: NextRequest) {
  const token = request.cookies.get('accessToken')?.value;
  if (!token) {
    return NextResponse.json({ error: '로그인이 필요해요.' }, { status: 401 });
  }

  try {
    await withdrawMember({ token });
  } catch (error) {
    const status = error instanceof ApiError ? error.status : 500;
    const message = status === 401
      ? '로그인이 만료되었어요. 다시 로그인해 주세요.'
      : '회원 탈퇴에 실패했어요. 잠시 후 다시 시도해 주세요.';
    return NextResponse.json({ error: message }, { status });
  }

  return new NextResponse(null, {
    status: 303,
    headers: { Location: '/app/api/auth/logout?_toast=withdrawal' },
  });
}
