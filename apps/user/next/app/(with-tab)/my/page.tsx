import { cookies } from 'next/headers';
import { getCustomerMe, getMemberMe } from '@dearbloom/shared';
import { MyMenu } from './MyMenu';
import { ProfileUpdatedToast } from './ProfileUpdatedToast';
import { Header } from '@dearbloom/ui';
import { DefaultAvatar } from '@/src/components/common/DefaultAvatar';

export const dynamic = 'force-dynamic';

export default async function MyPage({
  searchParams,
}: {
  searchParams: Promise<{ updated?: string }>;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get('accessToken')?.value;
  const { updated } = await searchParams;

  const login = (message: string) => (
    <div className="mx-auto max-w-md">
      <Header showBack={false} title="마이페이지" />
      <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
        <p className="text-body-5 text-neutral-500">{message}</p>
        <a href="/app/login" className="rounded-md bg-primary px-5 py-2.5 text-body-5 text-neutral-0">
          로그인
        </a>
      </div>
    </div>
  );

  if (!token) return login('로그인이 필요해요.');

  const [customer, member] = await Promise.all([
    getCustomerMe({ token }).catch(() => null),
    getMemberMe({ token }).catch(() => null),
  ]);
  if (!customer || !member) return login('로그인이 필요해요.');

  return (
    <div className="mx-auto max-w-md">
      <Header showBack={false} title="마이페이지" />

      {/* 프로필 — Figma 실측: 헤더 아래 20px, 좌우 16px, 아바타 48 + gap 12 */}
      <section className="flex items-center justify-between px-4 pt-5">
        <div className="flex min-w-0 items-center gap-3">
          <DefaultAvatar />
          <div className="flex min-w-0 flex-col gap-0.5">
            <span className="truncate text-head-2 text-neutral-950">{customer.name}</span>
            <span className="truncate text-caption-1 text-neutral-600">{member.email}</span>
          </div>
        </div>
        <a
          href="/app/profile/edit"
          className="shrink-0 rounded-md border border-neutral-300 bg-neutral-100 px-3 py-1 text-body-1 text-neutral-950"
        >
          수정
        </a>
      </section>

      {/* 메뉴 + 로그아웃 모달 */}
      <MyMenu />

      {updated === '1' ? <ProfileUpdatedToast /> : null}
    </div>
  );
}
