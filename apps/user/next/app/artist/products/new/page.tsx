import { cookies } from 'next/headers';
import { ArtworkForm } from './ArtworkForm';
import { LoginRequired } from '../../../(auth)/LoginRequired';
import { Header } from '@dearbloom/ui';

export const dynamic = 'force-dynamic';

export default async function NewArtworkPage() {
  const token = (await cookies()).get('accessToken')?.value;

  const header = <Header backHref="/app/artist/products" title="작품 등록" />;

  if (!token) {
    return (
      <div className="mx-auto max-w-md">
        {header}
        <LoginRequired
          description="작가 계정으로 로그인해야 작품을 등록할 수 있어요."
          returnUrl="/app/artist/products/new"
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md">
      {header}
      <ArtworkForm />
    </div>
  );
}
