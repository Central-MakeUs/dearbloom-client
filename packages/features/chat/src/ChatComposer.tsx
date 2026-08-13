'use client';

import { useRef, useState } from 'react';
import { ArrowUp, Plus } from 'lucide-react';
import { cn } from '@dearbloom/ui';

interface ChatComposerProps {
  onSendText: (content: string) => Promise<void>;
  onSendImage: (file: File) => Promise<void>;
  disabled?: boolean;
}

/**
 * 하단 입력창 — 텍스트 전송 + 사진 첨부(한 번에 한 장, 텍스트와 별개 메시지).
 *
 * Figma 234:6470 실측 — 바 높이 60 + 상단 1px 구분선, 좌우 16/상하 8,
 * 필드 44 흰색 radius 8, 전송 버튼 34×34 radius 6(우측 5).
 * 첨부 버튼은 Figma 에 없어 필드 폭(343)을 건드리지 않도록 필드 **안쪽 왼쪽**에 두고,
 * 전송 버튼과 같은 34×34 로 맞춘다.
 */
export function ChatComposer({ onSendText, onSendImage, disabled = false }: ChatComposerProps) {
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

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

  async function pickImage(file: File | undefined) {
    if (!file || busy) return;
    setBusy(true);
    try {
      await onSendImage(file);
    } finally {
      setBusy(false);
      // 같은 파일을 연달아 고를 때도 change 가 뜨도록 값을 비운다.
      if (fileInput.current) fileInput.current.value = '';
    }
  }

  // 전송 버튼(채워진 사각형)과 경쟁하지 않도록 첨부는 배경 없는 아이콘으로 둔다.
  const attachButton = (
    <>
      <input
        ref={fileInput}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => void pickImage(e.target.files?.[0])}
      />
      <button
        type="button"
        aria-label="사진 첨부"
        disabled={busy || disabled}
        onClick={() => fileInput.current?.click()}
        className="absolute left-[5px] top-[5px] flex h-[34px] w-[34px] items-center justify-center rounded-[6px] text-neutral-500 disabled:opacity-40"
      >
        <Plus size={24} strokeWidth={2} aria-hidden />
      </button>
    </>
  );

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
          className="h-11 w-full rounded-md bg-neutral-0 pl-[45px] pr-[45px] text-body-2 text-neutral-950 outline-none placeholder:text-neutral-400"
        />
        {attachButton}
        {sendButton}
      </div>
    </div>
  );
}
