'use client';

import { useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { type MyArtworkListItem } from '@dearbloom/shared';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  Button,
  Card,
  SkeletonImage,
} from '@dearbloom/ui';

const formatPrice = (won: number) => `${won.toLocaleString('ko-KR')}원`;

export function MyArtworkList({ items: initial }: { items: MyArtworkListItem[] }) {
  const [items, setItems] = useState(initial);
  const [deleting, setDeleting] = useState<number | null>(null);

  async function remove(id: number) {
    if (deleting) return;
    setDeleting(id);
    try {
      const res = await fetch(`/app/api/artist/artworks?id=${id}`, { method: 'DELETE' });
      if (res.ok) setItems((prev) => prev.filter((x) => x.artworkId !== id));
    } finally {
      setDeleting(null);
    }
  }

  return (
    <>
      <p className="mb-3 px-4 pt-1 text-caption-1 text-neutral-600">{items.length}개</p>
      <div className="flex flex-col gap-2 px-4">
        {items.map((a) => (
        <Card key={a.artworkId} className="flex items-center gap-3 p-2">
          <a href={`/snaps/${a.artworkId}`} className="flex min-w-0 flex-1 items-center gap-3">
            <SkeletonImage src={a.thumbnailUrl} alt={a.title} className="size-16 shrink-0 rounded-md" />
            <div className="min-w-0">
              <div className="truncate text-body-4 text-neutral-950">{a.title}</div>
              <div className="text-body-6 text-primary">{formatPrice(a.price)}</div>
              <div className="mt-0.5 text-caption-2 text-neutral-500">
                저장 {a.savedCount} · 조회 {a.viewCount}
              </div>
            </div>
          </a>
          <div className="flex shrink-0 flex-col gap-1">
            <Button asChild variant="outline" size="sm">
              <a href={`/app/artist/products/${a.artworkId}/edit`}>
                <Pencil className="size-3.5" /> 수정
              </a>
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" disabled={deleting === a.artworkId}>
                  <Trash2 className="size-3.5" /> {deleting === a.artworkId ? '삭제 중' : '삭제'}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>작품을 삭제할까요?</AlertDialogTitle>
                  <AlertDialogDescription>삭제하면 되돌릴 수 없어요.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>취소</AlertDialogCancel>
                  <AlertDialogAction className="bg-danger hover:opacity-90" onClick={() => remove(a.artworkId)}>
                    삭제
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </Card>
        ))}
      </div>
    </>
  );
}
