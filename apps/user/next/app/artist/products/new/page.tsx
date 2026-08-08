import { cookies } from 'next/headers';
import { ArtworkForm } from './ArtworkForm';
import { LOGIN_HREF } from '@/src/lib/env';
import { Header } from '@dearbloom/ui';

export const dynamic = 'force-dynamic';

export default async function NewArtworkPage() {
  const token = (await cookies()).get('accessToken')?.value;

  const header = <Header backHref="/app/artist/products" title="작품 등록" />;

  if (!token) {
    return (
      <div className="mx-auto max-w-md">
        {header}
        <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
          <p className="text-body-5 text-neutral-500">작가 계정으로 로그인해야 등록할 수 있어요.</p>
          <a href={LOGIN_HREF} className="rounded-md bg-primary px-5 py-2.5 text-body-5 text-neutral-0">로그인</a>
        </div>
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
