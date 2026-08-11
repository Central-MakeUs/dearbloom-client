import { cookies } from 'next/headers';
import { getSharedBoardSavedArtworks, type SharedSavedArtwork } from '@dearbloom/shared';
import { AddClient } from './AddClient';
import { notFound } from 'next/navigation';
import { parseSharedBoardId } from '@/src/lib/sharedBoardId';

export const dynamic = 'force-dynamic';

/** 상품 추가 — 내 저장 목록(서버)에서 선택해 보드에 담는다. */
export default async function BoardAddPage({ params }: { params: Promise<{ id: string }> }) {
  const rawId = (await params).id;
  const id = parseSharedBoardId(rawId);
  if (!id) notFound();
  const token = (await cookies()).get('accessToken')?.value;
  const savedItems: SharedSavedArtwork[] = token
    ? await getSharedBoardSavedArtworks(id, { token }).catch(() => [])
    : [];
  const items = savedItems.filter((item) => item.isShared || item.sharedBy === null);

  return <AddClient boardId={String(id)} items={items} />;
}
