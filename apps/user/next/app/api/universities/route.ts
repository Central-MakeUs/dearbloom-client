import { NextResponse, type NextRequest } from 'next/server';
import { searchUniversities } from '@dearbloom/shared';

/** 대학교 검색 프록시 (자동완성) */
export async function GET(request: NextRequest) {
  const keyword = request.nextUrl.searchParams.get('keyword')?.trim() ?? '';
  if (keyword.length === 0) return NextResponse.json([]);

  const token = request.cookies.get('accessToken')?.value;
  try {
    const data = await searchUniversities(keyword, 10, token ? { token } : undefined);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json([]);
  }
}
