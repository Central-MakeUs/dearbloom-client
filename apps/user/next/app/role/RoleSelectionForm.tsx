'use client';

import { useState, type ReactNode } from 'react';

import type { MemberRole } from '@dearbloom/shared';
import { BottomButton, cn, Header } from '@dearbloom/ui';

export function RoleSelectionForm() {
  const [role, setRole] = useState<MemberRole>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>();

  const submit = async () => {
    if (!role || isSubmitting) return;

    setIsSubmitting(true);
    setError(undefined);

    try {
      const response = await fetch('/app/api/members/role', {
        body: JSON.stringify({ role }),
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      });
      const body = (await response.json()) as { destination?: string; message?: string };

      if (!response.ok || !body.destination) {
        throw new Error(body.message ?? '역할을 선택하지 못했습니다.');
      }

      window.location.replace(body.destination);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : '역할을 선택하지 못했습니다.');
      setIsSubmitting(false);
    }
  };

  const roleCard = (value: MemberRole, title: string, description: ReactNode) => (
    <button
      aria-pressed={role === value}
      className={cn(
        'relative h-[145px] w-full overflow-hidden rounded-lg bg-primary-100 px-7 py-6 text-left shadow-elevation',
        role === value && 'ring-2 ring-primary',
      )}
      onClick={() => setRole(value)}
      type="button"
    >
      <span className="block text-head-2 text-neutral-950">{title}</span>
      <span className="mt-2 block w-[175px] text-body-2 text-neutral-950">{description}</span>
      <span
        aria-hidden
        className="absolute right-[23px] top-[30px] h-[84px] w-[84px] rounded-full bg-neutral-0"
      />
    </button>
  );

  const roles = (
    <div className="flex flex-col gap-4">
      {roleCard(
        'CUSTOMER',
        '모델 사용자에요',
        <>
          마음에 드는 작가를 찾아
          <br />
          촬영을 예약할 수 있어요.
        </>,
      )}
      {roleCard(
        'ARTIST',
        '작가 사용자에요',
        <>
          내 작품을 등록하고
          <br />
          촬영 문의를 받을 수 있어요.
        </>,
      )}
    </div>
  );

  const footer = (
    <div className="absolute inset-x-0 bottom-0 bg-neutral-100 px-4 pb-[max(8px,env(safe-area-inset-bottom))] pt-2">
      {error ? (
        <p className="mb-2 text-center text-caption-1 text-danger" role="alert">
          {error}
        </p>
      ) : null}
      <BottomButton color="black" disabled={!role || isSubmitting} onClick={submit}>
        {isSubmitting ? '확인 중...' : '다음'}
      </BottomButton>
    </div>
  );

  return (
    <main className="min-h-dvh bg-neutral-100">
      <div className="relative mx-auto min-h-dvh max-w-[375px] overflow-hidden pb-20">
        <Header onBack={() => window.history.back()} />
        <section className="px-4 pt-2">
          <h1 className="px-1 py-3 text-head-1 text-neutral-950">
            디어블룸 이용 방식을 선택해 주세요.
          </h1>
          <div className="mt-2">{roles}</div>
        </section>
        {footer}
      </div>
    </main>
  );
}
