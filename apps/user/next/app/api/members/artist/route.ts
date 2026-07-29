import { NextResponse, type NextRequest } from 'next/server';

import {
  ApiError,
  ARTIST_REGION_OPTIONS,
  createArtist,
  type ArtistRegionCode,
} from '@dearbloom/shared';

import { LOGIN_HREF } from '@/src/lib/env';

export async function POST(request: NextRequest) {
  const token = request.cookies.get('accessToken')?.value;
  if (!token) return redirectRelative(LOGIN_HREF);

  const formData = await request.formData();
  const nickname = String(formData.get('nickname') ?? '').trim();
  const imageUrl = String(formData.get('imageUrl') ?? '').trim();
  const region = getRegion(String(formData.get('region') ?? ''));

  if (!nickname || nickname.length > 20 || !imageUrl || !region) {
    return redirectRelative('/app/onboarding/artist?error=invalid');
  }

  try {
    const result = await createArtist({ nickname, imageUrl, regionList: [region] }, { token });
    return redirectRelative('/app/artist/dashboard', result.accessToken, request.nextUrl.protocol === 'https:');
  } catch (error) {
    const reason = error instanceof ApiError ? error.code ?? 'api' : 'failed';
    return redirectRelative(`/app/onboarding/artist?error=${encodeURIComponent(reason)}`);
  }
}

function getRegion(input: string): ArtistRegionCode | undefined {
  const normalized = input.trim();
  return ARTIST_REGION_OPTIONS.find(
    (region) => region.label === normalized || region.value === normalized.toUpperCase(),
  )?.value;
}

function redirectRelative(location: string, accessToken?: string, secure = true) {
  const response = new NextResponse(null, { status: 303, headers: { Location: location } });
  if (accessToken) {
    response.cookies.set('accessToken', accessToken, {
      httpOnly: true,
      path: '/',
      sameSite: 'lax',
      secure,
    });
  }

  return response;
}
