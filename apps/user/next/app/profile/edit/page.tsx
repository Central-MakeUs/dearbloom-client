import { cookies } from 'next/headers';
import { getMemberMe } from '@dearbloom/shared';
import { EditForm } from './EditForm';

export const dynamic = 'force-dynamic';

const Header = () => (
  <header className="flex h-[52px] items-center bg-neutral-100 px-2">
    <a href="/app/my" aria-label="뒤로가기" className="flex h-11 w-11 items-center justify-center text-neutral-950">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="m15 18-6-6 6-6" />
      </svg>
    </a>
    <h1 className="absolute left-1/2 -translate-x-1/2 text-head-3 text-neutral-950">프로필 수정하기</h1>
  </header>
);

export default async function ProfileEditPage() {
  const token = (await cookies()).get('accessToken')?.value;

  if (!token) {
    return (
      <div className="mx-auto flex min-h-screen max-w-md flex-col bg-neutral-100">
        <Header />
        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
          <p className="text-body-5 text-neutral-500">로그인이 필요해요.</p>
          <a href="/app/dev/login" className="rounded-md bg-primary px-5 py-2.5 text-body-5 text-neutral-0">
            로그인
          </a>
        </div>
      </div>
    );
  }

  const me = await getMemberMe({ token }).catch(() => null);

  return (
    <div className="relative mx-auto flex min-h-screen max-w-md flex-col bg-neutral-100">
      <Header />
      <EditForm initialName={me?.name ?? ''} />
    </div>
  );
}
