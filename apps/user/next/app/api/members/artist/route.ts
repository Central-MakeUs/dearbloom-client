import { NextResponse, type NextRequest } from 'next/server';

import { ApiError, ARTIST_REGION_OPTIONS, createArtist, nicknameSchema } from '@dearbloom/shared';

import { LOGIN_HREF } from '@/src/lib/env';
import { setAuthCookie, setOnboardingPendingCookie } from '@/src/lib/authCookies';
import { withFlashToast } from '@/src/lib/flashToast';

import { parseArtistRegions } from './artistRegions';

export async function POST(request: NextRequest) {
  const token = request.cookies.get('accessToken')?.value;
  if (!token) return redirectRelative(request, LOGIN_HREF);

  const formData = await request.formData();
  const nickname = String(formData.get('nickname') ?? '').trim();
  const imageUrl = String(formData.get('imageUrl') ?? '').trim();
  const regions = parseArtistRegions(formData.getAll('region'), ARTIST_REGION_OPTIONS);

  if (!imageUrl || !regions) {
    return redirectRelative(request, '/app/onboarding/artist?error=invalid');
  }

  const parsedNickname = nicknameSchema.safeParse(nickname);
  if (!parsedNickname.success) {
    return redirectRelative(request, '/app/onboarding/artist?error=invalid');
  }

  let result;
  try {
    result = await createArtist({ nickname, imageUrl, regionList: regions }, { token });
  } catch (error) {
    if (error instanceof ApiError && error.status === 409) {
      return NextResponse.json({ message: '중복된 닉네임' }, { status: 409 });
    }
    const reason = error instanceof ApiError ? (error.code ?? 'api') : 'failed';
    return redirectRelative(request, `/app/onboarding/artist?error=${encodeURIComponent(reason)}`);
  }

  return redirectRelative(
    request,
    withFlashToast('/app/artist/dashboard', 'welcome'),
    result.accessToken,
  );
}

function redirectRelative(request: NextRequest, location: string, accessToken?: string) {
  const response = new NextResponse(null, { status: 303, headers: { Location: location } });
  if (accessToken) {
    setAuthCookie(request, response, 'accessToken', accessToken);
    setOnboardingPendingCookie(request, response, false);
  }

  return response;
}
