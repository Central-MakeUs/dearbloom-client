'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, showToast } from '@dearbloom/ui';
import { ConfirmDialog } from '@/src/components/common/ConfirmDialog';

/** 문의 취소 — 카드 안쪽 연한 그린 버튼(Figma). 진행중 문의에서만 노출된다. */
export function CancelInquiry({ id }: { id: number }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const cancel = async () => {
    setBusy(true);
    setError('');
    try {
      const response = await fetch(`/app/api/inquiries/${id}/cancel`, { method: 'PATCH' });
      if (response.ok) {
        showToast('문의를 취소했어요.');
        router.push('/my/reservations');
        router.refresh();
        return;
      }
      const body = (await response.json().catch(() => ({}))) as { error?: string };
      setError(body.error || '취소에 실패했어요.');
    } catch {
      setError('네트워크 연결을 확인하고 다시 시도해 주세요.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Button
        type="button"
        variant="secondary"
        size="lg"
        className="w-full bg-primary-50 text-body-3 text-primary hover:bg-primary-100"
        onClick={() => {
          setError('');
          setOpen(true);
        }}
      >
        문의 취소하기
      </Button>
      <ConfirmDialog
        isError={Boolean(error)}
        isOpen={open}
        isPending={busy}
        title="문의를 취소하시겠어요?"
        message={error || '취소하면 되돌릴 수 없어요.'}
        onCancel={() => setOpen(false)}
        onConfirm={() => void cancel()}
      />
    </>
  );
}
