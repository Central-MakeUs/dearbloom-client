'use client';

import { useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { Button, cn, showToast } from '@dearbloom/ui';
import type { InquiryStatus } from '@dearbloom/shared';
import { ConfirmDialog } from '@/src/components/common/ConfirmDialog';
import { replaceApp } from '@/src/lib/appNavigation';
import { ACTION_BAR_BOTTOM } from './actionBar';

type Action = 'reserve' | 'reserve-cancel' | 'cancel';

/**
 * 세 액션 모두 화면에서 되돌릴 수 없는 상태 전이라 확인을 한 번 받는다.
 * (취소된 문의를 되살리거나 예약을 되돌리는 화면이 없다)
 */
interface Confirm {
  title: string;
  message: string;
  /** '확인' 대신 실제 행동을 적는다 — "문의를 취소할까요?" 에서는 '취소'가 양쪽 뜻으로 읽힌다. */
  confirmLabel: string;
  isDestructive: boolean;
  success: string;
}

const CONFIRM: Record<Action, Confirm> = {
  cancel: {
    title: '문의를 취소할까요?',
    message: '취소하면 고객에게 취소로 안내되고, 이 문의는 되돌릴 수 없어요.',
    confirmLabel: '문의 취소하기',
    isDestructive: true,
    success: '문의를 취소했어요.',
  },
  reserve: {
    title: '예약을 확정할까요?',
    message: '확정하면 고객에게 예약 완료로 안내되고, 해당 시간은 예약으로 잡혀요.',
    confirmLabel: '예약 확정하기',
    isDestructive: false,
    success: '예약을 완료했어요.',
  },
  'reserve-cancel': {
    title: '예약을 취소할까요?',
    message: '취소하면 고객에게 예약 취소로 안내되고, 되돌릴 수 없어요.',
    confirmLabel: '예약 취소하기',
    isDestructive: true,
    success: '예약을 취소했어요.',
  },
};

export function InquiryActions({ id, status }: { id: number; status: InquiryStatus }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [pending, setPending] = useState<Action>();

  const run = async (action: Action) => {
    setBusy(true);
    const res = await fetch(`/app/api/artist/inquiries/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    });
    setBusy(false);
    if (res.ok) {
      setPending(undefined);
      showToast(CONFIRM[action].success);
      replaceApp(router, '/app/artist/requests');
      router.refresh();
    } else {
      const b = (await res.json().catch(() => ({}))) as { error?: string };
      showToast(b.error || '처리에 실패했어요.', 'error');
    }
  };

  let buttons: ReactNode = null;
  if (status === 'RESERVED') {
    buttons = (
      <Button
        type="button"
        variant="outline"
        size="lg"
        className="flex-1"
        disabled={busy}
        onClick={() => setPending('reserve-cancel')}
      >
        예약 취소
      </Button>
    );
  } else if (status === 'IN_PROGRESS') {
    buttons = (
      <>
        <Button
          type="button"
          variant="outline"
          size="lg"
          className="flex-1"
          disabled={busy}
          onClick={() => setPending('cancel')}
        >
          문의 취소
        </Button>
        <Button
          type="button"
          variant="primary"
          size="lg"
          className="flex-1"
          disabled={busy}
          onClick={() => setPending('reserve')}
        >
          예약 완료
        </Button>
      </>
    );
  }

  if (!buttons) return null;

  return (
    <>
      <div className={cn('fixed inset-x-0 z-20 border-t border-neutral-200 bg-neutral-0 p-4', ACTION_BAR_BOTTOM)}>
        <div className="mx-auto flex max-w-md gap-2">{buttons}</div>
      </div>
      <ConfirmDialog
        isOpen={pending !== undefined}
        isPending={busy}
        title={pending ? CONFIRM[pending].title : ''}
        message={pending ? CONFIRM[pending].message : ''}
        confirmLabel={pending ? CONFIRM[pending].confirmLabel : '확인'}
        isDestructive={pending ? CONFIRM[pending].isDestructive : false}
        cancelLabel="돌아가기"
        onCancel={() => setPending(undefined)}
        onConfirm={() => pending && run(pending)}
      />
    </>
  );
}
