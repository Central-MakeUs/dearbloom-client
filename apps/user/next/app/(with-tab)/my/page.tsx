import { cookies } from 'next/headers';
import { getMemberMe, type SocialProvider } from '@dearbloom/shared';

export const dynamic = 'force-dynamic';

const providerLabel: Record<SocialProvider, string> = {
  GOOGLE: '구글',
  APPLE: '애플',
};

/** 실제 동작하는 메뉴 + 아직 백엔드가 없는 고도화(준비중) 메뉴 */
const menu: { label: string; href?: string }[] = [
  { label: '예약·문의 내역', href: '/app/my/reservations' },
  { label: '내가 작성한 후기' },
  { label: '내가 작성한 Q&A' },
  { label: '공지사항' },
  { label: '문의하기' },
  { label: '알림 설정' },
];

export default async function MyPage() {
  const token = (await cookies()).get('accessToken')?.value;

  const login = (message: string) => (
    <div className="mx-auto max-w-md">
      <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
        <p className="text-body-4 text-neutral-500">{message}</p>
        <a href="/app/dev/login" className="rounded-md bg-primary px-5 py-2.5 text-body-4 text-neutral-0">
          로그인
        </a>
      </div>
    </div>
  );

  if (!token) return login('로그인이 필요해요.');

  const me = await getMemberMe({ token }).catch(() => null);
  if (!me) return login('계정 정보를 불러오지 못했어요. 다시 로그인해주세요.');

  const profile = (
    <header className="px-4 pt-6">
      <div className="flex items-center gap-3">
        <div className="h-16 w-16 shrink-0 rounded-full bg-gradient-to-br from-primary-200 to-primary-400" />
        <div className="min-w-0 flex-1">
          <div className="truncate text-head-2 text-neutral-950">{me.name}</div>
          <div className="truncate text-caption-1 text-neutral-600">
            {me.email} · {providerLabel[me.recentSocialProvider]} 로그인
          </div>
        </div>
        <a
          href="/app/onboarding/basic"
          className="whitespace-nowrap rounded-full border border-neutral-300 px-3 py-1.5 text-caption-1 text-neutral-700"
        >
          프로필 편집
        </a>
      </div>
    </header>
  );

  const menuList = (
    <nav className="mt-6 border-t border-neutral-200 bg-neutral-0">
      {menu.map((m) =>
        m.href ? (
          <a
            key={m.label}
            href={m.href}
            className="flex items-center gap-3 border-b border-neutral-200 px-4 py-4 transition-colors hover:bg-neutral-100"
          >
            <span className="flex-1 text-body-3 text-neutral-900">{m.label}</span>
            <span aria-hidden className="text-neutral-400">
              ›
            </span>
          </a>
        ) : (
          <div
            key={m.label}
            className="flex items-center gap-3 border-b border-neutral-200 px-4 py-4"
            aria-disabled
          >
            <span className="flex-1 text-body-3 text-neutral-400">{m.label}</span>
            <span className="text-caption-2 text-neutral-400">준비중</span>
          </div>
        ),
      )}
    </nav>
  );

  const footer = (
    <div className="px-4 py-6">
      <a href="/app/api/auth/logout" className="text-body-5 text-neutral-500 underline underline-offset-2">
        로그아웃
      </a>
    </div>
  );

  return (
    <div className="mx-auto max-w-md">
      {profile}
      {menuList}
      {footer}
    </div>
  );
}
