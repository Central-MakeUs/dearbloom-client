import { NextResponse, type NextRequest } from 'next/server';
import { addRecurringBlock, deleteRecurringBlock, ApiError, type RecurringBlockInput } from '@dearbloom/shared';

/** 반복 예약 불가 추가. */
export async function POST(request: NextRequest) {
  const token = request.cookies.get('accessToken')?.value;
  if (!token) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const body = (await request.json()) as RecurringBlockInput;
  try {
    await addRecurringBlock(body, { token });
    return new NextResponse(null, { status: 204 });
  } catch (e) {
    const status = e instanceof ApiError ? e.status : 500;
    return NextResponse.json({ error: e instanceof Error ? e.message : 'failed' }, { status });
  }
}

/** 반복 예약 불가 삭제. ?id={scheduleRuleId} */
export async function DELETE(request: NextRequest) {
  const token = request.cookies.get('accessToken')?.value;
  if (!token) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const id = Number(request.nextUrl.searchParams.get('id'));
  if (!Number.isFinite(id)) return NextResponse.json({ error: 'invalid id' }, { status: 400 });
  try {
    await deleteRecurringBlock(id, { token });
    return new NextResponse(null, { status: 204 });
  } catch (e) {
    const status = e instanceof ApiError ? e.status : 500;
    return NextResponse.json({ error: e instanceof Error ? e.message : 'failed' }, { status });
  }
}
