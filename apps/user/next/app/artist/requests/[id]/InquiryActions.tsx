'use client';

import { useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@dearbloom/ui';

type Action = 'reserve' | 'reserve-cancel' | 'cancel';

export function InquiryActions({ id, status }: { id: number; status?: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const run = async (action: Action, successMsg: string) => {
    setBusy(true);
    const res = await fetch(`/app/api/artist/inquiries/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    });
    setBusy(false);
    if (res.ok) {
      toast.success(successMsg);
      router.push('/artist/requests');
      router.refresh();
    } else {
      const b = (await res.json().catch(() => ({}))) as { error?: string };
      toast.error(b.error || '처리에 실패했어요.');
    }
  };

  let buttons: ReactNode = null;
  if (status === 'RESERVED') {
    buttons = (
      <Button type="button" variant="outline" size="lg" className="flex-1" disabled={busy} onClick={() => run('reserve-cancel', '예약을 취소했어요.')}>예약 취소</Button>
    );
  } else if (!status || status === 'IN_PROGRESS') {
    buttons = (
      <>
        <Button type="button" variant="outline" size="lg" className="flex-1" disabled={busy} onClick={() => run('cancel', '문의를 취소했어요.')}>문의 취소</Button>
        <Button type="button" variant="primary" size="lg" className="flex-1" disabled={busy} onClick={() => run('reserve', '예약을 완료했어요.')}>예약 완료</Button>
      </>
    );
  }

  if (!buttons) return null;

  return (
    <div className="fixed inset-x-0 bottom-[60px] z-20 border-t border-neutral-200 bg-neutral-0 p-4">
      <div className="mx-auto flex max-w-md gap-2">{buttons}</div>
    </div>
  );
}
