import { cookies } from 'next/headers';
import {
  getSavedArtworks,
  getSharedBoards,
  type ArtworkListItem,
  type SharedBoardSummary,
} from '@dearbloom/shared';
import { SavedView } from './SavedView';
import { LoginRequired } from '../../(auth)/LoginRequired';

export const dynamic = 'force-dynamic';

export default async function SavedPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const cookieStore = await cookies();
  const { tab } = await searchParams;
  const token = cookieStore.get('accessToken')?.value;

  if (!token) {
    return (
      <div className="mx-auto max-w-md">
        <LoginRequired description="로그인하고 작품을 저장해 보세요." returnUrl="/app/saved" />
      </div>
    );
  }

  const [items, boards]: [ArtworkListItem[], SharedBoardSummary[]] = await Promise.all([
    getSavedArtworks({ token }).catch(() => []),
    getSharedBoards({ token }).catch(() => []),
  ]);

  return (
    <SavedView
      initialItems={items}
      initialBoards={boards}
      initialTab={tab === 'board' ? 'board' : 'saved'}
    />
  );
}
