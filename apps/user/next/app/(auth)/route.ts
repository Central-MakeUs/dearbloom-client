import { NextResponse } from 'next/server';

export function GET() {
  return new NextResponse(null, {
    headers: { Location: '/snaps' },
    status: 307,
  });
}
