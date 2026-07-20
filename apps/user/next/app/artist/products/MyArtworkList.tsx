'use client';

import { useState } from 'react';
import { type ArtworkListItem } from '@dearbloom/shared';

const formatPrice = (won: number) => `${won.toLocaleString()}원`;

export function MyArtworkList({ items: initial }: { items: ArtworkListItem[] }) {
  const [items, setItems] = useState(initial);
  const [deleting, setDeleting] = useState<number | null>(null);

  async function remove(id: number) {
    if (deleting) return;
    if (!window.confirm('이 작품을 삭제할까요?')) return;
    setDeleting(id);
    try {
      const res = await fetch(`/app/api/artist/artworks?id=${id}`, { method: 'DELETE' });
      if (res.ok) setItems((prev) => prev.filter((x) => x.artworkId !== id));
    } finally {
      setDeleting(null);
    }
  }

  return (
    <ul className="flex flex-col gap-2 px-4">
      {items.map((a) => (
        <li key={a.artworkId} className="flex items-center gap-3 rounded-lg border border-neutral-200 bg-neutral-0 p-2">
          <a href={`/snaps/${a.artworkId}`} className="flex min-w-0 flex-1 items-center gap-3">
            <img src={a.thumbnailUrl} alt={a.title} className="h-16 w-16 shrink-0 rounded-md object-cover" />
            <div className="min-w-0">
              <div className="truncate text-body-3 text-neutral-950">{a.title}</div>
              <div className="text-body-5 text-primary">{formatPrice(a.price)}</div>
            </div>
          </a>
          <button
            type="button"
            onClick={() => remove(a.artworkId)}
            disabled={deleting === a.artworkId}
            className="shrink-0 rounded-md border border-neutral-300 px-3 py-1.5 text-caption-1 text-neutral-600 disabled:opacity-50"
          >
            {deleting === a.artworkId ? '삭제 중' : '삭제'}
          </button>
        </li>
      ))}
    </ul>
  );
}
