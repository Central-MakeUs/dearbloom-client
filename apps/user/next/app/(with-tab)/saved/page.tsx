import { cookies } from 'next/headers';
import { getSavedArtworks, type ArtworkListItem } from '@dearbloom/shared';
import { SavedGrid } from './SavedGrid';

export const dynamic = 'force-dynamic';

export default async function SavedPage() {
  const token = (await cookies()).get('accessToken')?.value;

  let items: ArtworkListItem[] = [];
  let needLogin = false;
  if (!token) {
    needLogin = true;
  } else {
    items = await getSavedArtworks({ token }).catch(() => []);
  }

  const header = (
    <header className="mb-4 px-4 pt-6">
      <h1 className="text-head-1 text-neutral-950">내 저장</h1>
      <p className="mt-1 text-caption-1 text-neutral-600">저장한 작품 {items.length}개</p>
    </header>
  );

  const body = needLogin ? (
    <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
      <p className="text-body-4 text-neutral-500">로그인하면 저장한 작품을 볼 수 있어요.</p>
      <a href="/app/dev/login" className="rounded-md bg-primary px-5 py-2.5 text-body-4 text-neutral-0">
        로그인
      </a>
    </div>
  ) : items.length === 0 ? (
    <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
      <p className="text-body-4 text-neutral-500">아직 저장한 작품이 없어요.</p>
      <a href="/snaps" className="rounded-md bg-primary px-5 py-2.5 text-body-4 text-neutral-0">
        작품 탐색하기
      </a>
    </div>
  ) : (
    <SavedGrid items={items} />
  );

  return (
    <div className="mx-auto max-w-md">
      {header}
      {body}
    </div>
  );
}
