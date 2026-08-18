import { cookies } from 'next/headers';
import { getMyArtwork } from '@dearbloom/shared';
import { EditForm } from './EditForm';
import { LoginRequired } from '../../../../(auth)/LoginRequired';
import { AppBackHeader } from '@/src/components/common/AppBackHeader';

export const dynamic = 'force-dynamic';

export default async function EditArtworkPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const token = (await cookies()).get('accessToken')?.value;

  const header = <AppBackHeader fallbackHref="/app/artist/products" title="작품 수정" />;

  if (!token) {
    return (
      <div className="mx-auto max-w-md">
        {header}
        <LoginRequired
          description="작가 계정으로 로그인해 주세요."
          returnUrl={`/app/artist/products/${id}/edit`}
        />
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
      <EditForm
        id={art.artworkId}
        title={art.title}
        description={art.description ?? ''}
        photos={art.photoList}
        packages={art.packageList}
      />
    </div>
  );
}
