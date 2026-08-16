'use client';

import { useEffect, useState } from 'react';
import { BottomSheet } from '@dearbloom/ui';
import { SocialLoginButtons } from './SocialLoginButtons';

interface LoginSheetProps {
  /** 로그인 후 돌아올 경로. 기본은 이 시트가 뜬 화면. */
  returnUrl?: string;
  title?: string;
  description?: string;
}

/**
 * 비로그인으로 채팅·마이 탭에 들어왔을 때 아래에서 올라오는 소셜 로그인 시트.
 *
 * 예전에는 화면 안에 '로그인이 필요해요 [로그인]' 를 두고 한 번 더 누르게 했는데,
 * 탭을 누른 시점에 이미 로그인이 필요하다는 게 확정이라 한 단계를 없앴다(QA).
 * 닫으면 다시 열 수 있도록 화면의 안내 문구는 남겨둔다.
 */
export function LoginSheet({
  returnUrl,
  title = '로그인이 필요해요',
  description = '로그인하고 모든 기능을 이용해 보세요.',
}: LoginSheetProps) {
  const [open, setOpen] = useState(false);
  const [redirect, setRedirect] = useState(returnUrl);

  // 마운트 후에 열어야 아래에서 올라오는 전환이 보인다. 처음부터 open 이면 이미 올라온 채로 그려진다.
  useEffect(() => {
    setRedirect((prev) => prev ?? window.location.pathname + window.location.search);
    const id = requestAnimationFrame(() => setOpen(true));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-md bg-primary px-5 py-2.5 text-body-5 text-neutral-0"
      >
        로그인
      </button>
      <BottomSheet open={open} onOpenChange={setOpen} title={title}>
        <div className="flex flex-col gap-2 px-4 pb-2">
          <h2 className="text-head-3 text-neutral-950">{title}</h2>
          <p className="mb-2 text-body-6 text-neutral-600">{description}</p>
          <SocialLoginButtons forceOnboarding={false} returnUrl={redirect} />
        </div>
      </BottomSheet>
    </>
  );
}
