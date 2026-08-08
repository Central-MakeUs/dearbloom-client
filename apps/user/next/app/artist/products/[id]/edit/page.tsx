import { cookies } from 'next/headers';
import { getMyArtwork } from '@dearbloom/shared';
import { EditForm } from './EditForm';
import { LOGIN_HREF } from '@/src/lib/env';
import { Header } from '@dearbloom/ui';

export const dynamic = 'force-dynamic';

export default async function EditArtworkPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const token = (await cookies()).get('accessToken')?.value;

  const header = <Header backHref="/app/artist/products" title="작품 수정" />;

  if (!token) {
    return (
      <div className="mx-auto max-w-md">
        {header}
        <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
          <p className="text-body-6 text-neutral-500">작가 계정으로 로그인해주세요.</p>
          <a href={LOGIN_HREF} className="rounded-md bg-primary px-5 py-2.5 text-body-6 text-neutral-0">로그인</a>
        </div>
      </div>
    );
  }

  const art = await getMyArtwork(id, { token }).catch(() => null);
  if (!art) {
    return (
      <div className="mx-auto max-w-md">
        {header}
        <p className="px-4 py-16 text-center text-body-6 text-neutral-500">작품을 불러오지 못했어요.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md">
      {header}
      <EditForm id={art.artworkId} title={art.title} description={art.description ?? ''} photos={art.photoList} />
    </div>
  );
}
