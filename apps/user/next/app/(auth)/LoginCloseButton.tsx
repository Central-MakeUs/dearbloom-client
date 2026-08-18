'use client';

import { X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { navigateAppBack } from '@/src/lib/appNavigation';

/**
 * 로그인 화면 닫기(X).
 *
 * DearBloom 내부 entry에서만 실제 뒤로가기를 하고, 직접 진입이면 복귀 경로를 교체한다.
 */
export function LoginCloseButton({ fallbackHref }: { fallbackHref: string }) {
  const router = useRouter();

  function close() {
    navigateAppBack(router, fallbackHref);
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
