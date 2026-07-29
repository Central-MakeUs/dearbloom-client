import { NextResponse, type NextRequest } from 'next/server';

import {
  ApiError,
  ARTIST_REGION_OPTIONS,
  createArtist,
  type ArtistRegionCode,
  updateArtistImage,
} from '@dearbloom/shared';

import { setAuthCookie } from '@/src/lib/authCookies';

export async function POST(request: NextRequest) {
  const token = request.cookies.get('accessToken')?.value;
  if (!token) return redirectRelative(request, '/app/dev/login');

  const formData = await request.formData();
  const nickname = String(formData.get('nickname') ?? '').trim();
  const imageUrl = String(formData.get('imageUrl') ?? '').trim();
  const region = getRegion(String(formData.get('region') ?? ''));

  if (!nickname || nickname.length > 20 || !imageUrl || !region) {
    return redirectRelative(request, '/app/onboarding/artist?error=invalid');
  }

  let result;
  try {
    result = await createArtist({ nickname, regionList: [region] }, { token });
  } catch (error) {
    const reason = error instanceof ApiError ? error.code ?? 'api' : 'failed';
    return redirectRelative(request, `/app/onboarding/artist?error=${encodeURIComponent(reason)}`);
  }

  try {
    await updateArtistImage(imageUrl, { token: result.accessToken });
  } catch {
    return redirectRelative(request, '/app/artist/dashboard?error=profile-image', result.accessToken);
  }

  return redirectRelative(request, '/app/artist/dashboard', result.accessToken);
}

function getRegion(input: string): ArtistRegionCode | undefined {
  const normalized = input.trim();
  return ARTIST_REGION_OPTIONS.find(
    (region) => region.label === normalized || region.value === normalized.toUpperCase(),
  )?.value;
}

function redirectRelative(request: NextRequest, location: string, accessToken?: string) {
  const response = new NextResponse(null, { status: 303, headers: { Location: location } });
  if (accessToken) {
    setAuthCookie(request, response, 'accessToken', accessToken);
  }

  return response;
}
