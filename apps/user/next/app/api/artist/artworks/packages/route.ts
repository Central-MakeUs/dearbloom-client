import { NextResponse, type NextRequest } from 'next/server';
import { updateArtworkPackages, ApiError, type ArtworkPackageInput } from '@dearbloom/shared';

function authToken(request: NextRequest) {
  return request.cookies.get('accessToken')?.value;
}

/** 작품 패키지 전체 교체 프록시 (?id=, body: {packageList}) */
export async function PUT(request: NextRequest) {
  const token = authToken(request);
  if (!token) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const id = request.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

  const body = (await request.json()) as { packageList: ArtworkPackageInput[] };
  try {
    await updateArtworkPackages(id, body.packageList, { token });
    return new NextResponse(null, { status: 204 });
  } catch (e) {
    const status = e instanceof ApiError ? e.status : 500;
    return NextResponse.json({ error: e instanceof Error ? e.message : 'failed' }, { status });
  }
}
