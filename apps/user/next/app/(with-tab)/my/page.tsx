import { cookies } from 'next/headers';
import { getCustomerMe, getMemberMe } from '@dearbloom/shared';
import { MyMenu } from './MyMenu';
import { ProfileUpdatedToast } from './ProfileUpdatedToast';
import { CustomerProfileAvatar, Header } from '@dearbloom/ui';
import { AppLink } from '@/src/components/common/AppLink';
import { LoginSheet } from '../../(auth)/LoginSheet';

export const dynamic = 'force-dynamic';

export default async function MyPage({
  searchParams,
}: {
  searchParams: Promise<{ updated?: string }>;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get('accessToken')?.value;
  const { updated } = await searchParams;

  // 탭을 누른 시점에 로그인 필요가 확정이라, 안내만 남기고 로그인 시트를 바로 올린다(QA).
  const login = (message: string) => (
    <div className="mx-auto max-w-md">
      <Header showBack={false} title="마이페이지" />
      <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
        <p className="text-body-5 text-neutral-500">{message}</p>
        <LoginSheet returnUrl="/app/my" />
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
          <CustomerProfileAvatar color={customer.profileColor} />
          <div className="flex min-w-0 flex-col gap-0.5">
            <span className="truncate text-head-2 text-neutral-950">{customer.name}</span>
            <span className="truncate text-caption-1 text-neutral-600">{member.email}</span>
          </div>
        </div>
        <AppLink
          href="/app/profile/edit"
          className="shrink-0 rounded-md border border-neutral-300 bg-neutral-100 px-3 py-1 text-body-1 text-neutral-950"
        >
          수정
        </AppLink>
      </section>

      {/* 메뉴 + 로그아웃 모달 */}
      <MyMenu />

      {updated === '1' ? <ProfileUpdatedToast /> : null}
    </div>
  );
}
