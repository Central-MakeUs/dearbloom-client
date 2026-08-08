import { cookies } from 'next/headers';
import { getArtistMe } from '@dearbloom/shared';
import { ProfileForm } from './ProfileForm';
import { LOGIN_HREF } from '@/src/lib/env';
import { Header } from '@dearbloom/ui';

export const dynamic = 'force-dynamic';

export default async function ArtistProfilePage() {
  const token = (await cookies()).get('accessToken')?.value;

  const header = <Header backHref="/app/artist/products" title="작가 프로필" />;

  const prompt = (message: string) => (
    <div className="mx-auto max-w-md">
      {header}
      <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
        <p className="text-body-5 text-neutral-500">{message}</p>
        <a href={LOGIN_HREF} className="rounded-md bg-primary px-5 py-2.5 text-body-5 text-neutral-0">로그인</a>
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
