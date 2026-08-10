import { cookies } from 'next/headers';
import { getCustomerMe, getMemberMe } from '@dearbloom/shared';
import { MyMenu } from './MyMenu';
import { Header } from '@dearbloom/ui';

export const dynamic = 'force-dynamic';

export default async function MyPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('accessToken')?.value;

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

      {/* 프로필 */}
      <section className="flex items-center justify-between px-4 py-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="h-12 w-12 shrink-0 rounded-full bg-neutral-300" />
          <div className="flex min-w-0 flex-col gap-0.5">
            <span className="truncate text-head-2 text-neutral-950">{customer.name}</span>
            <span className="truncate text-caption-1 text-neutral-600">{member.email}</span>
          </div>
        </div>
        <a
          href="/app/profile/edit"
          className="shrink-0 rounded-md border border-neutral-300 px-3 py-1 text-body-1 text-neutral-950"
        >
          수정
        </a>
      </section>

      {/* 메뉴 + 로그아웃/탈퇴 모달 */}
      <MyMenu />
    </div>
  );
}
