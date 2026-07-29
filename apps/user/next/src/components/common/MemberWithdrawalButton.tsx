'use client';

import { useState } from 'react';

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

  const dialog = isOpen ? (
    <div className="fixed inset-0 z-50 flex items-center justify-center" role="dialog" aria-modal>
      <button
        aria-label="닫기"
        className="absolute inset-0 bg-neutral-950/70"
        disabled={isWithdrawing}
        onClick={() => setIsOpen(false)}
        type="button"
      />
      <div className="relative w-[303px] rounded-md bg-neutral-0 p-4">
        <div className="flex flex-col items-center gap-2.5 pb-6 pt-3">
          <h2 className="text-head-3 text-neutral-950">탈퇴하기</h2>
          <p className="text-center text-body-6 text-neutral-800">
            {error || '탈퇴하면 모든 계정 정보가 삭제되며 복구할 수 없어요. 정말 탈퇴하시겠습니까?'}
          </p>
        </div>
        <div className="flex gap-2.5">
          <button
            className="h-12 flex-1 rounded-[6px] bg-neutral-200 text-body-1 text-neutral-800 disabled:opacity-40"
            disabled={isWithdrawing}
            onClick={() => setIsOpen(false)}
            type="button"
          >
            취소
          </button>
          <button
            className="h-12 flex-1 rounded-[6px] bg-primary text-body-1 text-neutral-0 disabled:opacity-40"
            disabled={isWithdrawing}
            onClick={() => void withdraw()}
            type="button"
          >
            {isWithdrawing ? '처리 중…' : '확인'}
          </button>
        </div>
      </div>
    </div>
  ) : null;

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
        <svg
          aria-hidden
          fill="none"
          height="24"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          width="24"
          className="text-neutral-400"
        >
          <path d="m9 18 6-6-6-6" />
        </svg>
      </button>
      {dialog}
    </>
  );
}
