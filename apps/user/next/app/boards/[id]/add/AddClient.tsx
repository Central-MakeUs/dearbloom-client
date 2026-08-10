'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArtworkCard, BottomButton, Header } from '@dearbloom/ui';
import {
  artistRegionLabel,
  type ArtworkListItem,
  type SharedSavedArtwork,
} from '@dearbloom/shared';
import { useBoardStore, type BoardArtwork } from '@/src/stores/boardStore';
import { showCandidateToast } from '../CandidateToast';

const toBoardArtwork = (a: ArtworkListItem): BoardArtwork => ({
  artworkId: a.artworkId,
  title: a.title,
  artistNickname: a.artistNickname,
  price: a.lowestPrice,
  thumbnailUrl: a.thumbnailUrl,
  regions: a.artistRegionList?.map(artistRegionLabel) ?? [],
});

const sameIds = (left: Set<number>, right: Set<number>) =>
  left.size === right.size && [...left].every((id) => right.has(id));

export function AddClient({ boardId, items }: { boardId: string; items: SharedSavedArtwork[] }) {
  const router = useRouter();
  const board = useBoardStore((s) => s.boards.find((item) => item.id === boardId));
  const setArtworks = useBoardStore((s) => s.setArtworks);
  const [selected, setSelected] = useState<Set<number>>();
  const [submitting, setSubmitting] = useState(false);

  const initialSelected = new Set([
    ...items.filter((item) => item.isShared).map((item) => item.artworkSummaryResponse.artworkId),
    ...(board?.artworks.map((item) => item.artworkId) ?? []),
  ]);
  const selectedIds = selected ?? initialSelected;
  const orderedItems = [...items].sort(
    (a, b) =>
      Number(initialSelected.has(b.artworkSummaryResponse.artworkId)) -
      Number(initialSelected.has(a.artworkSummaryResponse.artworkId)),
  );
  const hasChanges = !sameIds(selectedIds, initialSelected);

  const toggle = (id: number) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else if (next.size >= 3) {
      showCandidateToast('작품 후보는 인당 3개까지 추가 가능해요', 'error');
      return;
    } else next.add(id);
    setSelected(next);
  };

  const submit = async () => {
    setSubmitting(true);
    try {
      const artworkIdList = [...selectedIds];
      const chosen = orderedItems
        .map((item) => item.artworkSummaryResponse)
        .filter((item) => selectedIds.has(item.artworkId))
        .map(toBoardArtwork);

      if (board) setArtworks(boardId, chosen);
      if (Number.isFinite(Number(boardId))) {
        const response = await fetch(`/app/api/boards/${boardId}/artworks`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ artworkIdList }),
        });
        if (!response.ok) throw new Error('공동보드 저장 실패');
      }

      router.replace(`/boards/${boardId}?candidateUpdated=1`);
    } catch {
      showCandidateToast('작품 후보를 저장하지 못했어요', 'error');
      setSubmitting(false);
    }
  };

  const body =
    items.length === 0 ? (
      <div className="flex flex-col items-center gap-3 px-6 py-24 text-center">
        <p className="text-body-4 text-neutral-500">내 저장에 담긴 작품이 없어요.</p>
        <a href="/snaps" className="rounded-md bg-primary px-5 py-2.5 text-body-4 text-neutral-0">
          작품 탐색하기
        </a>
      </div>
    ) : (
      <div className="grid grid-cols-2 gap-x-2 gap-y-5 px-4 pb-28 pt-3">
        {orderedItems.map(({ artworkSummaryResponse: a }) => (
          <ArtworkCard
            key={a.artworkId}
            artworkId={a.artworkId}
            title={a.title}
            artistNickname={a.artistNickname}
            price={a.lowestPrice}
            thumbnailUrl={a.thumbnailUrl}
            regions={a.artistRegionList?.map(artistRegionLabel)}
            selectable
            selected={selectedIds.has(a.artworkId)}
            onSelect={() => toggle(a.artworkId)}
          />
        ))}
      </div>
    );

  return (
    <div className="mx-auto min-h-screen max-w-md bg-neutral-100">
      <Header showBack onBack={() => router.back()} title="내 후보 추가하기" />
      {body}
      <div className="fixed inset-x-0 bottom-0 z-20 mx-auto max-w-md bg-neutral-100 px-4 py-2">
        <BottomButton
          type="button"
          onClick={submit}
          disabled={!hasChanges || submitting}
        >
          보드에 추가하기 {selectedIds.size}/3
        </BottomButton>
      </div>
    </div>
  );
}
