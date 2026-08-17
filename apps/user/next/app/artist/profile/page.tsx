import { cookies } from 'next/headers';
import { getArtistMe } from '@dearbloom/shared';
import { ProfileForm } from './ProfileForm';
import { LoginRequired } from '../../(auth)/LoginRequired';
import { Header } from '@dearbloom/ui';

export const dynamic = 'force-dynamic';

export default async function ArtistProfilePage() {
  const token = (await cookies()).get('accessToken')?.value;

  const header = <Header backHref="/app/artist/products" title="작가 프로필" />;

  const prompt = (title: string, description: string) => (
    <div className="mx-auto max-w-md">
      {header}
      <LoginRequired title={title} description={description} returnUrl="/app/artist/profile" />
    </div>
  );

  if (!token) return prompt('로그인이 필요해요', '작가 계정으로 로그인해 주세요.');

  const me = await getArtistMe({ token }).catch(() => null);
  if (!me) return prompt('작가 정보를 불러오지 못했어요', '작가 계정으로 로그인했는지 확인해 주세요.');

  return (
    <div className="mx-auto max-w-md">
      {header}
      <ProfileForm initial={me} />
    </div>
  );
}
