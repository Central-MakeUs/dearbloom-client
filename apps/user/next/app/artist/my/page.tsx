import { cookies } from 'next/headers';
import { getMemberMe, getArtistMe } from '@dearbloom/shared';
import { Button, Header, SkeletonImage } from '@dearbloom/ui';
import { LOGIN_HREF } from '@/src/lib/env';

import { DefaultAvatar } from '@/src/components/common/DefaultAvatar';
import { MemberLogoutButton } from '@/src/components/common/MemberLogoutButton';
import { MyMenuRow } from '@/src/components/common/MyMenuRow';

export const dynamic = 'force-dynamic';

/**
 * 마이 메뉴.
 * 준비중(포인트·채팅 템플릿 관리·공지사항)은 출시 전 숨김 — 백엔드 준비 후 항목 추가로 복구.
 */
const menu: { label: string; href: string }[] = [
  { label: '개인정보 처리방침', href: '/privacy-policy' },
];

export default async function ArtistMyPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('accessToken')?.value;

  const login = (message: string) => (
    <div className="mx-auto max-w-md">
      <Header showBack={false} title="마이페이지" />
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

  const profile = (
    <section className="flex items-center justify-between px-4 pt-5">
      <div className="flex min-w-0 items-center gap-3">
        {artist.imageUrl ? (
          <SkeletonImage src={artist.imageUrl} alt="" className="size-12 shrink-0 rounded-full" />
        ) : (
          <DefaultAvatar />
        )}
        <div className="flex min-w-0 flex-col gap-0.5">
          <span className="truncate text-head-2 text-neutral-950">{displayName}</span>
          <span className="truncate text-caption-1 text-neutral-600">{me.email}</span>
        </div>
      </div>
      <a
        href="/app/artist/profile"
        className="shrink-0 rounded-md border border-neutral-300 bg-neutral-100 px-3 py-1 text-body-1 text-neutral-950"
      >
        수정
      </a>
    </section>
  );

  const nav = (
    <nav className="mt-5 flex flex-col gap-1 px-5">
      {menu.map((m) => (
        <MyMenuRow key={m.label} label={m.label} href={m.href} />
      ))}
      <MemberLogoutButton />
      <MyMenuRow label="탈퇴하기" href="/app/my/withdraw?from=artist" />
    </nav>
  );

  return (
    <div className="mx-auto max-w-md">
      <Header showBack={false} title="마이페이지" />
      {profile}
      {nav}
    </div>
  );
}
