'use client';

import { useState } from 'react';
import { ArrowUp } from 'lucide-react';
import { cn } from '@dearbloom/ui';

interface ChatComposerProps {
  onSendText: (content: string) => Promise<void>;
  disabled?: boolean;
}

/**
 * 하단 입력창 — 텍스트 전송.
 *
 * Figma 234:6470 실측 — 바 높이 60 + 상단 1px 구분선, 좌우 16/상하 8,
 * 필드 44 흰색 radius 8, 전송 버튼 34×34 radius 6(우측 5).
 * 사진 첨부는 백엔드에 API 가 있지만 디자인에 진입점이 없어 화면에서 뺀 상태다.
 */
export function ChatComposer({ onSendText, disabled = false }: ChatComposerProps) {
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);

  const canSend = text.trim().length > 0 && !busy && !disabled;

  async function send() {
    if (!canSend) return;
    const content = text.trim();
    setBusy(true);
    try {
      await onSendText(content);
      setText('');
    } finally {
      setBusy(false);
    }
  }

  // radius 6 은 디자인 토큰(4/8/12/16)에 없는 값이라 그대로 지정한다.
  const sendButton = (
    <button
      type="button"
      aria-label="보내기"
      disabled={!canSend}
      onClick={() => void send()}
      className={cn(
        'absolute right-[5px] top-[5px] flex h-[34px] w-[34px] items-center justify-center rounded-[6px] text-neutral-0 transition-colors',
        canSend ? 'bg-primary' : 'bg-neutral-300',
      )}
    >
      <ArrowUp size={24} strokeWidth={2} aria-hidden />
    </button>
  );

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 mx-auto max-w-md border-t border-neutral-200 bg-neutral-100 px-4 py-2 pb-[calc(8px+env(safe-area-inset-bottom))]">
      <div className="relative h-11">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              void send();
            }
          }}
          disabled={disabled}
          placeholder="메시지를 입력하세요"
          className="h-11 w-full rounded-md bg-neutral-0 pl-3 pr-[45px] text-body-2 text-neutral-950 outline-none placeholder:text-neutral-400"
        />
        {sendButton}
      </div>
    </div>
  );
}
