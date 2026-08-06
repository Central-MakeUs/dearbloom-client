import { NextResponse, type NextRequest } from 'next/server';

import {
  ApiError,
  ARTIST_REGION_OPTIONS,
  createArtist,
  nicknameSchema,
  switchMemberRole,
  updateArtistImage,
} from '@dearbloom/shared';

import {
  getTokenActiveRole,
  setAuthCookie,
  setOnboardingPendingCookie,
} from '@/src/lib/authCookies';

import { parseArtistRegions } from './artistRegions';

export async function POST(request: NextRequest) {
  const token = request.cookies.get('accessToken')?.value;
  if (!token) return errorResponse(401, '로그인이 필요합니다.');

  const formData = await request.formData();
  const nickname = nicknameSchema.safeParse(formData.get('nickname') ?? '');
  const imageUrl = String(formData.get('imageUrl') ?? '').trim();
  const regions = parseArtistRegions(formData.getAll('region'), ARTIST_REGION_OPTIONS);

  // 검증 실패는 리다이렉트가 아니라 JSON 으로 돌려준다 — 페이지가 리로드되면
  // 이미 업로드한 프로필 사진과 선택한 지역이 모두 사라진다.
  if (!nickname.success) {
    return errorResponse(400, nickname.error.issues[0]?.message ?? '작가 이름을 확인해 주세요.');
  }
  if (!imageUrl) return errorResponse(400, '프로필 사진을 등록해 주세요.');
  if (!regions) return errorResponse(400, '활동 지역을 1개 이상 선택해 주세요.');

  let accessToken: string;
  try {
    const result = await createArtist({ nickname: nickname.data, regionList: regions }, { token });
    accessToken =
      getTokenActiveRole(result.accessToken) === 'ARTIST'
        ? result.accessToken
        : (await switchMemberRole('ARTIST', { token: result.accessToken })).accessToken;
  } catch (error) {
    if (error instanceof ApiError) return errorResponse(error.status, error.message);

    return errorResponse(502, '작가 정보를 저장하지 못했습니다.');
  }

  // 여기부터는 작가 프로필이 이미 생성된 상태 — 새 accessToken 을 심고 대시보드로 보낸다.
  try {
    await updateArtistImage(imageUrl, { token: accessToken });
  } catch {
    return redirectRelative(request, '/app/artist/dashboard?error=profile-image', accessToken);
  }

  return redirectRelative(request, '/app/artist/dashboard', accessToken);
}

function errorResponse(status: number, message: string) {
  return NextResponse.json({ message }, { status });
}

function redirectRelative(request: NextRequest, location: string, accessToken: string) {
  const response = new NextResponse(null, { status: 303, headers: { Location: location } });
  setAuthCookie(request, response, 'accessToken', accessToken);
  setOnboardingPendingCookie(request, response, false);

  return response;
}
