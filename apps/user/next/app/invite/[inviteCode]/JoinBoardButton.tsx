'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BottomButton, Spinner } from '@dearbloom/ui';

import { goLogin } from '@/src/lib/goLogin';

export function JoinBoardButton({
  inviteCode,
  joinedBoardId,
}: {
  inviteCode: string;
  joinedBoardId?: number;
}) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const join = async () => {
    if (submitting) return;
    if (joinedBoardId) {
      router.replace(`/boards/${joinedBoardId}`);
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`/app/api/invite/${encodeURIComponent(inviteCode)}`, {
        method: 'POST',
      });
      if (response.status === 401) {
        goLogin(`/app/invite/${inviteCode}`);
        return;
      }
      if (!response.ok) throw new Error('공동보드 입장 실패');
      const joined = (await response.json()) as { sharedBoardId: number };
      router.replace(`/boards/${joined.sharedBoardId}`);
    } catch {
      setSubmitting(false);
    }
  };

  return (
    <BottomButton type="button" onClick={join} disabled={submitting}>
      {submitting ? <Spinner className="size-5 text-current" label="" /> : null}
      공동보드 참여하기
    </BottomButton>
  );
}
