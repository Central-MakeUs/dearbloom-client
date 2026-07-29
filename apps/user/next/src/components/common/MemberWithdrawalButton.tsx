'use client';

import { useState } from 'react';
import { ChevronRight } from 'lucide-react';

import { ConfirmDialog } from './ConfirmDialog';

export function MemberWithdrawalButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [error, setError] = useState('');

  const withdraw = async () => {
    if (isWithdrawing) return;

    setIsWithdrawing(true);
    setError('');

    try {
      const response = await fetch('/app/api/auth/withdraw', { method: 'DELETE' });
      if (response.redirected) {
        window.location.assign(response.url);
        return;
      }

      const body = (await response.json().catch(() => null)) as { error?: string } | null;
      setError(body?.error ?? '회원 탈퇴에 실패했어요. 잠시 후 다시 시도해 주세요.');
    } catch {
      setError('네트워크 연결을 확인하고 다시 시도해 주세요.');
    } finally {
      setIsWithdrawing(false);
    }
  };

  return (
    <>
      <button
        className="flex h-11 items-center justify-between transition-colors hover:opacity-70"
        onClick={() => {
          setError('');
          setIsOpen(true);
        }}
        type="button"
      >
        <span className="text-body-1 text-neutral-950">탈퇴하기</span>
        <ChevronRight className="size-6 text-neutral-400" aria-hidden />
      </button>
      <ConfirmDialog
        isError={Boolean(error)}
        isOpen={isOpen}
        isPending={isWithdrawing}
        message={error || '탈퇴하면 모든 계정 정보가 삭제되며 복구할 수 없어요. 정말 탈퇴하시겠습니까?'}
        onCancel={() => setIsOpen(false)}
        onConfirm={() => void withdraw()}
        title="탈퇴하기"
      />
    </>
  );
}
