import { NextResponse, type NextRequest } from 'next/server';
import {
  createArtwork,
  updateArtwork,
  deleteArtwork,
  ApiError,
  type CreateArtworkPayload,
  type UpdateArtworkPayload,
} from '@dearbloom/shared';

function authToken(request: NextRequest) {
  return request.cookies.get('accessToken')?.value;
}

function errorResponse(e: unknown) {
  const status = e instanceof ApiError ? e.status : 500;
  return NextResponse.json({ error: e instanceof Error ? e.message : 'failed' }, { status });
}

/** 작품 등록 프록시 */
export async function POST(request: NextRequest) {
  const token = authToken(request);
  if (!token) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const body = (await request.json()) as CreateArtworkPayload;
  try {
    const data = await createArtwork(body, { token });
    return NextResponse.json(data);
  } catch (e) {
    return errorResponse(e);
  }
}

/** 작품 수정 프록시 (?id=, body: {title?, description?}) */
export async function PATCH(request: NextRequest) {
  const token = authToken(request);
  if (!token) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const id = request.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

  const body = (await request.json()) as UpdateArtworkPayload;
  try {
    await updateArtwork(id, body, { token });
    return new NextResponse(null, { status: 204 });
  } catch (e) {
    return errorResponse(e);
  }
}

/** 작품 삭제 프록시 (?id=) */
export async function DELETE(request: NextRequest) {
  const token = authToken(request);
  if (!token) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const id = request.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

  try {
    await deleteArtwork(id, { token });
    return new NextResponse(null, { status: 204 });
  } catch (e) {
    return errorResponse(e);
  }
}
