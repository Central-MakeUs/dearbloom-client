'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@dearbloom/ui';

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
    <div className="fixed inset-x-0 bottom-[60px] z-20 border-t border-neutral-200 bg-neutral-0 p-4">
      <div className="mx-auto max-w-md">
        <Button type="button" variant="outline" size="lg" onClick={cancel} disabled={busy} className="w-full">
          문의 취소
        </Button>
      </div>
    </div>
  );
}
