'use client';

import { useState } from 'react';
import { Check } from 'lucide-react';
import { BottomButton, cn, Spinner, showToast } from '@dearbloom/ui';

/**
 * 탈퇴 동의 체크 + 하단 CTA.
 * 안내문을 확인해야만 탈퇴 버튼이 열립니다 — 되돌릴 수 없는 행동이라 한 단계 잠가둔 것.
 */
export function WithdrawForm() {
  const [isAgreed, setIsAgreed] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  const withdraw = async () => {
    if (isWithdrawing) return;
    setIsWithdrawing(true);

    try {
      const response = await fetch('/app/api/auth/withdraw', { method: 'DELETE' });
      if (response.redirected) {
        window.location.assign(response.url);
        return;
      }

      const body = (await response.json().catch(() => null)) as { error?: string } | null;
      showToast(body?.error ?? '회원 탈퇴에 실패했어요. 잠시 후 다시 시도해 주세요.', 'error');
    } catch {
      showToast('네트워크 연결을 확인하고 다시 시도해 주세요.', 'error');
    } finally {
      setIsWithdrawing(false);
    }
  };

  // Figma 실측: 안내문 아래 36px, 카드 343x52 / primary-100, 체크박스 24 radius 6, 좌 여백 17px
  const agreement = (
    <button
      type="button"
      role="checkbox"
      aria-checked={isAgreed}
      onClick={() => setIsAgreed((prev) => !prev)}
      className="mx-4 mt-9 flex h-[52px] items-center gap-3 rounded-md bg-primary-100 pl-[17px] text-left"
    >
      <span
        className={cn(
          'flex size-6 shrink-0 items-center justify-center rounded-[6px] transition-colors',
          isAgreed
            ? 'bg-primary text-neutral-0'
            : 'border border-neutral-300 bg-neutral-0 text-neutral-300',
        )}
      >
        <Check className="size-[18px]" strokeWidth={2.5} aria-hidden />
      </span>
      <span className="text-body-5 text-neutral-900">안내 내용을 확인했습니다.</span>
    </button>
  );

  const cta = (
    <div className="fixed inset-x-0 bottom-0 z-20 mx-auto max-w-[375px] bg-neutral-100 px-4 pb-[max(16px,env(safe-area-inset-bottom))] pt-2">
      <BottomButton
        color="green"
        disabled={!isAgreed || isWithdrawing}
        onClick={() => void withdraw()}
      >
        {isWithdrawing ? <Spinner className="size-5 text-current" label="" /> : null}
        {isWithdrawing ? '처리 중…' : '탈퇴하기'}
      </BottomButton>
    </div>
  );

  return (
    <>
      {agreement}
      {cta}
    </>
  );
}
