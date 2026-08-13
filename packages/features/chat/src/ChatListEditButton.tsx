'use client';

import { useCallback, useState } from 'react';
import { SquarePen } from 'lucide-react';
import { ChatToast } from './ChatToast';

/**
 * 채팅 목록 헤더의 편집 버튼(Figma icons/44/edit).
 *
 * 편집 모드는 방 삭제 API 가 있어야 동작하는데 백엔드에 해당 엔드포인트가 없고
 * Figma 의 '채팅 목록 편집'(1221:20377) 도 빈 화면이라, 지금은 '준비 중' 안내만 한다.
 */
export function ChatListEditButton() {
  const [toast, setToast] = useState<string | null>(null);
  const dismissToast = useCallback(() => setToast(null), []);

  return (
    <>
      <button
        type="button"
        aria-label="채팅 목록 편집"
        onClick={() => setToast('아직 준비 중인 기능이에요.')}
        className="flex h-11 w-11 items-center justify-center text-neutral-800"
      >
        <SquarePen size={24} strokeWidth={2} aria-hidden />
      </button>
      {/* 목록 화면은 하단탭(60) 위에 띄운다. */}
      <ChatToast
        message={toast}
        onDismiss={dismissToast}
        className="bottom-[calc(68px+env(safe-area-inset-bottom))]"
      />
    </>
  );
}
