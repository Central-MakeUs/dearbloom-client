import { cookies } from 'next/headers';
import { getMemberMe } from '@dearbloom/shared';
import { MyMenu } from './MyMenu';

export const dynamic = 'force-dynamic';

export default async function MyPage() {
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

  if (!token) return login('로그인이 필요해요.');

  const me = await getMemberMe({ token }).catch(() => null);
  if (!me) return login('계정 정보를 불러오지 못했어요. 다시 로그인해주세요.');

  return (
    <div className="mx-auto max-w-md">
      <header className="flex h-[52px] items-center justify-center">
        <h1 className="text-head-3 text-neutral-950">마이페이지</h1>
      </header>

      {/* 프로필 */}
      <section className="flex items-center justify-between px-4 py-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="h-12 w-12 shrink-0 rounded-full bg-neutral-300" />
          <div className="flex min-w-0 flex-col gap-0.5">
            <span className="truncate text-head-2 text-neutral-950">{me.name}</span>
            <span className="truncate text-caption-1 text-neutral-600">{me.email}</span>
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
