'use client';

import { useState } from 'react';
import { SaveHeart } from '@dearbloom/ui';
import { regionLabels, type ArtworkListItem } from '@dearbloom/shared';

const formatPrice = (won: number) => `${Math.round(won / 10000).toLocaleString()}만원`;

/**
 * 저장 목록 그리드 — 서버가 넘긴 초기 목록을 클라이언트에서 관리.
 * 하트로 저장 취소하면 카드를 즉시 제거.
 */
export function SavedGrid({ items: initial }: { items: ArtworkListItem[] }) {
  const [items, setItems] = useState(initial);

  return (
    <div className="grid grid-cols-2 gap-x-3 gap-y-5 px-4 pb-6">
      {items.map((a) => (
        <div key={a.artworkId} className="flex flex-col">
          <a
            href={`/snaps/${a.artworkId}`}
            className="relative mb-2 block aspect-[4/5] overflow-hidden rounded-md bg-neutral-200"
          >
            <img src={a.thumbnailUrl} alt={a.title} loading="lazy" className="h-full w-full object-cover" />
          </a>
          <div className="flex items-start justify-between gap-2">
            <a href={`/snaps/${a.artworkId}`} className="min-w-0 flex-1">
              <div className="truncate text-body-4 text-neutral-950">{a.title}</div>
              <div className="mt-0.5 flex items-center gap-1.5">
                <span className="truncate text-body-6 text-neutral-950">{a.artistNickname}</span>
                <span className="h-3 w-px shrink-0 bg-neutral-600" />
                <span className="shrink-0 text-body-4 text-primary">{formatPrice(a.price)}</span>
              </div>
              {a.artistRegionList?.length > 0 && (
                <div className="truncate text-caption-2 text-neutral-600">{regionLabels(a.artistRegionList)}</div>
              )}
            </a>
            <SaveHeart
              artworkId={a.artworkId}
              initialSaved
              onChange={(saved) => {
                if (!saved) setItems((prev) => prev.filter((x) => x.artworkId !== a.artworkId));
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
