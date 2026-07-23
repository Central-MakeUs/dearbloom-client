import { NextResponse, type NextRequest } from 'next/server';
import { updateWeeklyAvailability, ApiError, type WeeklyAvailabilityInput } from '@dearbloom/shared';

/** 기본 촬영 가능 일정(주간) 전체 교체. */
export async function PUT(request: NextRequest) {
  const token = request.cookies.get('accessToken')?.value;
  if (!token) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const body = (await request.json()) as { availabilityList?: WeeklyAvailabilityInput[] };
  try {
    await updateWeeklyAvailability(body.availabilityList ?? [], { token });
    return new NextResponse(null, { status: 204 });
  } catch (e) {
    const status = e instanceof ApiError ? e.status : 500;
    return NextResponse.json({ error: e instanceof Error ? e.message : 'failed' }, { status });
  }
}
