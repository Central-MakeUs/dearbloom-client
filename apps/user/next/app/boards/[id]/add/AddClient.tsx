'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArtworkCard, Header } from '@dearbloom/ui';
import { regionLabel, type ArtworkListItem } from '@dearbloom/shared';
import { useBoardStore, type BoardArtwork } from '@/src/stores/boardStore';

const toBoardArtwork = (a: ArtworkListItem): BoardArtwork => ({
  artworkId: a.artworkId,
  title: a.title,
  artistNickname: a.artistNickname,
  price: a.price,
  thumbnailUrl: a.thumbnailUrl,
  regions: a.artistRegionList?.map(regionLabel) ?? [],
});

export function AddClient({ boardId, items }: { boardId: string; items: ArtworkListItem[] }) {
  const router = useRouter();
  const addArtworks = useBoardStore((s) => s.addArtworks);
  const [selected, setSelected] = useState<Set<number>>(new Set());

  const toggle = (id: number) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const submit = () => {
    const chosen = items.filter((a) => selected.has(a.artworkId)).map(toBoardArtwork);
    addArtworks(boardId, chosen);
    router.replace(`/app/boards/${boardId}`);
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
      <div className="grid grid-cols-2 gap-x-3 gap-y-5 px-4 pb-28 pt-3">
        {items.map((a) => (
          <ArtworkCard
            key={a.artworkId}
            artworkId={a.artworkId}
            title={a.title}
            artistNickname={a.artistNickname}
            price={a.price}
            thumbnailUrl={a.thumbnailUrl}
            regions={a.artistRegionList?.map(regionLabel)}
            selectable
            selected={selected.has(a.artworkId)}
            onSelect={() => toggle(a.artworkId)}
          />
        ))}
      </div>
    );

  return (
    <div className="mx-auto min-h-screen max-w-md bg-neutral-100">
      <Header showBack onBack={() => router.back()} title="작품 추가" />
      {body}
      <div className="fixed inset-x-0 bottom-0 z-20 mx-auto max-w-md border-t border-neutral-200 bg-neutral-0 px-4 py-3">
        <button
          type="button"
          onClick={submit}
          disabled={selected.size === 0}
          className="w-full rounded-md bg-primary py-3 text-body-2 text-neutral-0 disabled:bg-neutral-300 disabled:text-neutral-500"
        >
          {selected.size > 0 ? `${selected.size}개 추가` : '작품 선택'}
        </button>
      </div>
    </div>
  );
}
