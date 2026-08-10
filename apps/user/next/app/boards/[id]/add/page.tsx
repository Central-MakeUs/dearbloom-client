import { cookies } from 'next/headers';
import {
  getSavedArtworks,
  getSharedBoardSavedArtworks,
  type SharedSavedArtwork,
} from '@dearbloom/shared';
import { AddClient } from './AddClient';

export const dynamic = 'force-dynamic';

/** 상품 추가 — 내 저장 목록(서버)에서 선택해 보드에 담는다. */
export default async function BoardAddPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const token = (await cookies()).get('accessToken')?.value;
  const items: SharedSavedArtwork[] = token
    ? await getSharedBoardSavedArtworks(id, { token }).catch(async () => {
        const saved = await getSavedArtworks({ token }).catch(() => []);
        return saved.map((artworkSummaryResponse) => ({ artworkSummaryResponse, isShared: false }));
      })
    : [];

  return <AddClient boardId={id} items={items} />;
}
