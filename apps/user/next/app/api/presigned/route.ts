import { NextResponse, type NextRequest } from 'next/server';
import { getPresignedUrl, ApiError, type FilePrefix } from '@dearbloom/shared';

/**
 * presigned URL 발급 프록시 (httpOnly 쿠키 → Bearer).
 * 역할과 무관한 엔드포인트라 고객/작가 양쪽에서 씁니다 — 작가 전용 폼은 `/api/artist/presigned` 를 계속 사용합니다.
 */
export async function POST(request: NextRequest) {
  const token = request.cookies.get('accessToken')?.value;
  if (!token) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const body = (await request.json()) as { prefix?: FilePrefix; fileName?: string };
  if (!body.prefix) return NextResponse.json({ error: 'prefix required' }, { status: 400 });
  if (!body.fileName) return NextResponse.json({ error: 'fileName required' }, { status: 400 });

  try {
    const data = await getPresignedUrl({ prefix: body.prefix, fileName: body.fileName }, { token });
    return NextResponse.json(data);
  } catch (e) {
    const status = e instanceof ApiError ? e.status : 500;
    return NextResponse.json({ error: e instanceof Error ? e.message : 'failed' }, { status });
  }
}
