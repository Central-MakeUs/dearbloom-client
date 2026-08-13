'use client';

import { useEffect, useState } from 'react';

/**
 * 프로필 수정 후 돌아왔을 때 뜨는 완료 토스트.
 * 수정 화면에서 띄우면 페이지 이동에 묻히므로 `?updated=1` 로 넘겨받아 여기서 띄우고,
 * 새로고침 때 다시 뜨지 않도록 쿼리를 지웁니다.
 *
 * 전역 sonner Toaster(top-center) 대신 직접 렌더합니다 — Figma 위치가 하단탭 바로 위입니다.
 */
export function ProfileUpdatedToast() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    window.history.replaceState(null, '', window.location.pathname);

    const timer = setTimeout(() => setIsVisible(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div
      role="status"
      className="pointer-events-none fixed inset-x-0 bottom-[73px] z-30 flex justify-center animate-in fade-in"
    >
      {/* pill 스타일은 공동보드 토스트(CandidateToast)와 동일하게 맞춘다. */}
      <div className="flex items-center gap-[2px] rounded-full bg-neutral-800 px-4 py-2 text-body-6 text-neutral-0 shadow-elevation">
        <span className="flex size-5 shrink-0 items-center justify-center">
          <img src="/app/images/toast-success.svg" alt="" className="size-3" />
        </span>
        <span className="whitespace-nowrap">프로필이 수정되었습니다</span>
      </div>
    </div>
  );
}
