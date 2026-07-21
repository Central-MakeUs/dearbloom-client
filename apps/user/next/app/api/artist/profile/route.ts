import { NextResponse, type NextRequest } from 'next/server';
import {
  updateArtistNickname,
  updateArtistIntro,
  updateArtistImage,
  updateArtistRegions,
  updateArtistPricing,
  ApiError,
  type ArtistRegionCode,
} from '@dearbloom/shared';

interface ProfilePatch {
  nickname?: string;
  intro?: string;
  artistImageUrl?: string;
  regionList?: ArtistRegionCode[];
  travelFeeInfo?: string;
  packageInfo?: string;
}

/** 작가 프로필 수정 프록시 — 제공된 필드만 각 백엔드 엔드포인트로 전달. */
export async function PATCH(request: NextRequest) {
  const token = request.cookies.get('accessToken')?.value;
  if (!token) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const body = (await request.json()) as ProfilePatch;
  const opts = { token };

  try {
    if (typeof body.nickname === 'string') await updateArtistNickname(body.nickname, opts);
    if (typeof body.intro === 'string') await updateArtistIntro(body.intro, opts);
    if (typeof body.artistImageUrl === 'string') await updateArtistImage(body.artistImageUrl, opts);
    if (Array.isArray(body.regionList)) await updateArtistRegions(body.regionList, opts);
    if (typeof body.travelFeeInfo === 'string' && typeof body.packageInfo === 'string') {
      await updateArtistPricing({ travelFeeInfo: body.travelFeeInfo, packageInfo: body.packageInfo }, opts);
    }
    return new NextResponse(null, { status: 204 });
  } catch (e) {
    const status = e instanceof ApiError ? e.status : 500;
    return NextResponse.json({ error: e instanceof Error ? e.message : 'failed' }, { status });
  }
}
