import { NextResponse, type NextRequest } from 'next/server';
import { getPresignedUrl, ApiError, type FilePrefix } from '@dearbloom/shared';

/** presigned URL 발급 프록시 (httpOnly 쿠키 → Bearer). */
export async function POST(request: NextRequest) {
  const token = request.cookies.get('accessToken')?.value;
  if (!token) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const body = (await request.json()) as { prefix?: FilePrefix; fileName?: string };
  if (!body.fileName) return NextResponse.json({ error: 'fileName required' }, { status: 400 });

  try {
    const data = await getPresignedUrl({ prefix: body.prefix ?? 'PORTFOLIO', fileName: body.fileName }, { token });
    return NextResponse.json(data);
  } catch (e) {
    const status = e instanceof ApiError ? e.status : 500;
    return NextResponse.json({ error: e instanceof Error ? e.message : 'failed' }, { status });
  }
}
