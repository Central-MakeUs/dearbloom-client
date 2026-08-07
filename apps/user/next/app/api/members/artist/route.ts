import { NextResponse, type NextRequest } from 'next/server';

import {
  ApiError,
  ARTIST_REGION_OPTIONS,
  createArtist,
} from '@dearbloom/shared';

import { LOGIN_HREF } from '@/src/lib/env';
import { setAuthCookie } from '@/src/lib/authCookies';

import { parseArtistRegions } from './artistRegions';

export async function POST(request: NextRequest) {
  const token = request.cookies.get('accessToken')?.value;
  if (!token) return redirectRelative(request, LOGIN_HREF);

  const formData = await request.formData();
  const imageUrl = String(formData.get('imageUrl') ?? '').trim();
  const regions = parseArtistRegions(formData.getAll('region'), ARTIST_REGION_OPTIONS);

  if (!imageUrl || !regions) {
    return redirectRelative(request, '/app/onboarding/artist?error=invalid');
  }

  let result;
  try {
    result = await createArtist({ imageUrl, regionList: regions }, { token });
  } catch (error) {
    const reason = error instanceof ApiError ? error.code ?? 'api' : 'failed';
    return redirectRelative(request, `/app/onboarding/artist?error=${encodeURIComponent(reason)}`);
  }

  return redirectRelative(request, '/app/artist/dashboard', result.accessToken);
}

function redirectRelative(request: NextRequest, location: string, accessToken?: string) {
  const response = new NextResponse(null, { status: 303, headers: { Location: location } });
  if (accessToken) {
    setAuthCookie(request, response, 'accessToken', accessToken);
  }

  return response;
}
