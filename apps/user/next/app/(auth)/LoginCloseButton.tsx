'use client';

import { X } from 'lucide-react';

/**
 * 로그인 화면 닫기(X).
 *
 * 로그인 유도 화면에서 push 로 올라오므로 뒤로가기가 곧 닫기다.
 * 히스토리가 없을 때(공유 링크·앱에서 바로 진입)만 복귀 경로로 이동한다 — 이때는
 * 닫힌 로그인 화면이 뒤에 남지 않게 replace 를 쓴다.
 */
export function LoginCloseButton({ fallbackHref }: { fallbackHref: string }) {
  function close() {
    if (window.history.length > 1) {
      window.history.back();
      return;
    }
    window.location.replace(fallbackHref);
  }

  return (
    <button
      type="button"
      aria-label="닫기"
      onClick={close}
      className="absolute right-1 top-1 z-10 flex h-11 w-11 items-center justify-center text-neutral-800"
    >
      <X size={24} strokeWidth={2} aria-hidden />
    </button>
  );
}
