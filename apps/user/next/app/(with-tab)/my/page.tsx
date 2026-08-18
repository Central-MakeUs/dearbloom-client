import { cookies } from 'next/headers';
import { getCustomerMe, getMemberMe } from '@dearbloom/shared';
import { MyMenu } from './MyMenu';
import { CustomerProfileAvatar, Header } from '@dearbloom/ui';
import { AppLink } from '@/src/components/common/AppLink';
import { LoginRequired } from '../../(auth)/LoginRequired';

export const dynamic = 'force-dynamic';

export default async function MyPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('accessToken')?.value;

  const login = (
    <div className="mx-auto max-w-md">
      <Header showBack={false} title="마이페이지" />
      <LoginRequired returnUrl="/app/my" />
    </div>
  );

  if (!token) return login;

  const [customer, member] = await Promise.all([
    getCustomerMe({ token }).catch(() => null),
    getMemberMe({ token }).catch(() => null),
  ]);
  // 쿠키가 남아 있어도 만료됐으면 조회가 실패한다 — 같은 로그인 안내로 수렴시킨다.
  if (!customer || !member) return login;

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
    </div>
  );
}
