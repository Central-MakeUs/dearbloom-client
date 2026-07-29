import { cookies } from 'next/headers';
import { ChevronRight } from 'lucide-react';
import { getMemberMe, getArtistMe } from '@dearbloom/shared';
import { Badge, Button } from '@dearbloom/ui';
import { LOGIN_HREF } from '@/src/lib/env';

import { MemberLogoutButton } from '@/src/components/common/MemberLogoutButton';
import { MemberWithdrawalButton } from '@/src/components/common/MemberWithdrawalButton';

export const dynamic = 'force-dynamic';

/** href 없는 항목은 아직 백엔드가 없어 노출만(준비중). */
const menu: { label: string; href?: string }[] = [
  { label: '포인트' },
  { label: '채팅 템플릿 관리' },
  { label: '공지사항' },
];

export default async function ArtistMyPage() {
  const token = (await cookies()).get('accessToken')?.value;

  const login = (message: string) => (
    <div className="mx-auto max-w-md">
      <header className="flex h-[52px] items-center justify-center">
        <h1 className="text-head-3 text-neutral-950">마이페이지</h1>
      </header>
      <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
        <p className="text-body-5 text-neutral-500">{message}</p>
        <Button asChild>
          <a href={LOGIN_HREF}>로그인</a>
        </Button>
      </div>
    </div>
  );

  if (!token) return login('작가 계정으로 로그인해주세요.');

  const [me, artist] = await Promise.all([
    getMemberMe({ token }).catch(() => null),
    getArtistMe({ token }).catch(() => null),
  ]);
  if (!me) return login('계정 정보를 불러오지 못했어요. 다시 로그인해주세요.');

  const displayName = artist?.nickname ?? me.name;

  return (
    <div className="mx-auto max-w-md">
      <header className="flex h-[52px] items-center justify-center">
        <h1 className="text-head-3 text-neutral-950">마이페이지</h1>
      </header>

      {/* 프로필 */}
      <section className="flex items-center justify-between px-4 py-3">
        <div className="flex min-w-0 items-center gap-3">
          {artist?.imageUrl ? (
            <img src={artist.imageUrl} alt="" className="h-12 w-12 shrink-0 rounded-full object-cover" />
          ) : (
            <div className="h-12 w-12 shrink-0 rounded-full bg-neutral-300" />
          )}
          <div className="flex min-w-0 flex-col gap-0.5">
            <span className="truncate text-head-2 text-neutral-950">{displayName}</span>
            <span className="truncate text-caption-1 text-neutral-600">{me.email}</span>
          </div>
        </div>
        <Button asChild variant="outline" size="sm" className="shrink-0">
          <a href="/app/artist/profile">수정</a>
        </Button>
      </section>

      {/* 메뉴 */}
      <nav className="mt-2 flex flex-col gap-1 px-5">
        {menu.map((m) =>
          m.href ? (
            <a key={m.label} href={m.href} className="flex h-11 items-center justify-between transition-colors hover:opacity-70">
              <span className="text-body-1 text-neutral-950">{m.label}</span>
              <ChevronRight className="size-6 text-neutral-400" aria-hidden />
            </a>
          ) : (
            <div key={m.label} className="flex h-11 items-center justify-between" aria-disabled>
              <span className="text-body-1 text-neutral-400">{m.label}</span>
              <Badge variant="muted">준비중</Badge>
            </div>
          ),
        )}
        <MemberLogoutButton />
        <MemberWithdrawalButton />
      </nav>
    </div>
  );
}
