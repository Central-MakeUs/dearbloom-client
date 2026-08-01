'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

/** 문의 취소 — 카드 안쪽 연한 그린 버튼(Figma). 진행중 문의에서만 노출된다. */
export function CancelInquiry({ id }: { id: number }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const cancel = async () => {
    setBusy(true);
    const res = await fetch(`/app/api/inquiries/${id}/cancel`, { method: 'PATCH' });
    setBusy(false);
    if (res.ok) {
      toast.success('문의를 취소했어요.');
      router.push('/my/reservations');
      router.refresh();
    } else {
      const b = (await res.json().catch(() => ({}))) as { error?: string };
      toast.error(b.error || '취소에 실패했어요.');
    }
  };

  return (
    <button
      type="button"
      onClick={cancel}
      disabled={busy}
      className="h-[52px] w-full rounded-md bg-primary-50 text-body-3 text-primary transition-colors hover:bg-primary-100 disabled:opacity-50"
    >
      {busy ? '취소하는 중…' : '문의 취소하기'}
    </button>
  );
}
