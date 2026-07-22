import { cookies } from 'next/headers';
import { getMemberMe, getArtistMe } from '@dearbloom/shared';

export const dynamic = 'force-dynamic';

const ChevronRight = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden className="text-neutral-400">
    <path d="m9 18 6-6-6-6" />
  </svg>
);

/** href 없는 항목은 아직 백엔드가 없어 노출만(준비중). */
const menu: { label: string; href?: string }[] = [
  { label: '포인트' },
  { label: '채팅 템플릿 관리' },
  { label: '공지사항' },
  { label: '로그아웃', href: '/app/api/auth/logout' },
  { label: '탈퇴하기' },
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
        <a href="/app/dev/login" className="rounded-md bg-primary px-5 py-2.5 text-body-5 text-neutral-0">
          로그인
        </a>
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
        <a
          href="/app/artist/profile"
          className="shrink-0 rounded-md border border-neutral-300 px-3 py-1 text-body-1 text-neutral-950"
        >
          수정
        </a>
      </section>

      {/* 메뉴 */}
      <nav className="mt-2 flex flex-col gap-1 px-5">
        {menu.map((m) =>
          m.href ? (
            <a key={m.label} href={m.href} className="flex h-11 items-center justify-between transition-colors hover:opacity-70">
              <span className="text-body-1 text-neutral-950">{m.label}</span>
              <ChevronRight />
            </a>
          ) : (
            <div key={m.label} className="flex h-11 items-center justify-between" aria-disabled>
              <span className="text-body-1 text-neutral-400">{m.label}</span>
              <span className="text-caption-2 text-neutral-400">준비중</span>
            </div>
          ),
        )}
      </nav>
    </div>
  );
}
