import { cookies } from 'next/headers';
import { getArtistMe } from '@dearbloom/shared';
import { ProfileForm } from './ProfileForm';

export const dynamic = 'force-dynamic';

export default async function ArtistProfilePage() {
  const token = (await cookies()).get('accessToken')?.value;

  const header = (
    <header className="flex h-[52px] items-center gap-2 border-b border-neutral-200 bg-neutral-0 px-2">
      <a href="/app/artist/products" aria-label="뒤로가기" className="flex h-11 w-11 items-center justify-center text-neutral-950">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="m15 18-6-6 6-6" /></svg>
      </a>
      <h1 className="text-head-3 text-neutral-950">작가 프로필</h1>
    </header>
  );

  const prompt = (message: string) => (
    <div className="mx-auto max-w-md">
      {header}
      <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
        <p className="text-body-5 text-neutral-500">{message}</p>
        <a href="/app/dev/login" className="rounded-md bg-primary px-5 py-2.5 text-body-5 text-neutral-0">로그인</a>
      </div>
    </div>
  );

  if (!token) return prompt('작가 계정으로 로그인해주세요.');

  const me = await getArtistMe({ token }).catch(() => null);
  if (!me) return prompt('작가 정보를 불러오지 못했어요. (작가 계정인지 확인)');

  return (
    <div className="mx-auto max-w-md">
      {header}
      <ProfileForm initial={me} />
    </div>
  );
}
