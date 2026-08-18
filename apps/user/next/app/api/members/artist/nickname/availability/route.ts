import { NextResponse, type NextRequest } from 'next/server';

import { ApiError, getArtistNicknameAvailability, nicknameSchema } from '@dearbloom/shared';

export async function GET(request: NextRequest) {
  const token = request.cookies.get('accessToken')?.value;
  if (!token) return NextResponse.json({ message: '로그인이 필요합니다.' }, { status: 401 });

  const nickname = request.nextUrl.searchParams.get('nickname')?.trim() ?? '';
  if (!nicknameSchema.safeParse(nickname).success) {
    return NextResponse.json({ message: '프로필 이름 형식이 올바르지 않습니다.' }, { status: 400 });
  }

  try {
    return NextResponse.json(await getArtistNicknameAvailability(nickname, { token }));
  } catch (error) {
    const status = error instanceof ApiError ? error.status : 502;
    return NextResponse.json(
      { message: '프로필 이름 중복 여부를 확인하지 못했습니다.' },
      { status },
    );
  }
}
