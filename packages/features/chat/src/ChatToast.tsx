'use client';

import { useEffect } from 'react';
import { cn } from '@dearbloom/ui';

interface ChatToastProps {
  /** 표시할 문구. null 이면 렌더하지 않는다. */
  message: string | null;
  onDismiss: () => void;
  /** 자동으로 사라지기까지 ms. */
  durationMs?: number;
  /** 하단 위치 조정(기본은 채팅방 입력창 위). 목록처럼 하단탭 위에 띄울 때 덮어쓰세요. */
  className?: string;
}

/**
 * 채팅방 하단 토스트 — Figma 1105:16699 실측(neutral-800, radius 30, 좌우 16/상하 8).
 * 입력창(60 + 상단 1px) 위 8 에 뜬다.
 */
export function ChatToast({ message, onDismiss, durationMs = 2000, className }: ChatToastProps) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(onDismiss, durationMs);
    return () => clearTimeout(timer);
  }, [message, durationMs, onDismiss]);

  if (!message) return null;

  return (
    <div
      role="status"
      className={cn(
        'pointer-events-none fixed inset-x-0 bottom-[calc(69px+env(safe-area-inset-bottom))] z-40 mx-auto flex max-w-md justify-center px-4',
        className,
      )}
    >
      <span className="rounded-[30px] bg-neutral-800 px-4 py-2 text-body-5 text-neutral-0">{message}</span>
    </div>
  );
}
