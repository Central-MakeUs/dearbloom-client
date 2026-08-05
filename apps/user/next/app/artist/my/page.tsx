import { cookies } from 'next/headers';
import { ChevronRight } from 'lucide-react';
import { getMemberMe, getArtistMe } from '@dearbloom/shared';
import { Badge, Button } from '@dearbloom/ui';
import { LOGIN_HREF } from '@/src/lib/env';

import { MemberLogoutButton } from '@/src/components/common/MemberLogoutButton';
import { MemberRoleSwitchButton } from '@/src/components/common/MemberRoleSwitchButton';
import { MemberWithdrawalButton } from '@/src/components/common/MemberWithdrawalButton';

export const dynamic = 'force-dynamic';

/**
 * 마이 메뉴. href 있는 항목은 이동, href 없는 항목은 '준비중' Badge로 노출.
 * 준비중(포인트·채팅 템플릿 관리·공지사항)은 출시 전 숨김 — 백엔드 준비 후 주석 해제로 복구.
 */
const menu: { label: string; href?: string }[] = [
  { label: '개인정보 처리방침', href: '/privacy-policy' },
  // { label: '포인트' },
  // { label: '채팅 템플릿 관리' },
  // { label: '공지사항' },
];

export default async function ArtistMyPage() {
  const cookieStore = await cookies();
  const token = cookieStore.has('onboardingPending')
    ? undefined
    : cookieStore.get('accessToken')?.value;

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
  if (!me || !artist) return login('작가 계정으로 로그인해주세요.');

  const displayName = artist.nickname;
  const roleSwitch =
    me.hasCustomer && me.hasArtist ? <MemberRoleSwitchButton targetRole="CUSTOMER" /> : null;

  return (
    <div className="mx-auto max-w-md">
      <header className="flex h-[52px] items-center justify-center">
        <h1 className="text-head-3 text-neutral-950">마이페이지</h1>
      </header>

      {/* 프로필 */}
      <section className="flex items-center justify-between px-4 py-3">
        <div className="flex min-w-0 items-center gap-3">
          {artist.imageUrl ? (
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
        {roleSwitch}
        <MemberLogoutButton />
        <MemberWithdrawalButton />
      </nav>
    </div>
  );
}
