'use client';

import { useRef, useState } from 'react';
import { ArrowUp, Plus } from 'lucide-react';
import { cn } from '@dearbloom/ui';

interface ChatComposerProps {
  onSendText: (content: string) => Promise<void>;
  onSendImage: (file: File) => Promise<void>;
  disabled?: boolean;
}

/** 하단 입력창 — 텍스트 전송 + 사진 첨부(한 번에 한 장, 텍스트와 별개 메시지). */
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
      if (fileInput.current) fileInput.current.value = '';
    }
  }

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
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-neutral-200 text-neutral-700 disabled:opacity-40"
      >
        <Plus size={20} strokeWidth={2} aria-hidden />
      </button>
    </>
  );

  const sendButton = (
    <button
      type="button"
      aria-label="보내기"
      disabled={!canSend}
      onClick={() => void send()}
      className={cn(
        'flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors',
        canSend ? 'bg-primary text-neutral-0' : 'bg-neutral-200 text-neutral-400',
      )}
    >
      <ArrowUp size={20} strokeWidth={2.5} aria-hidden />
    </button>
  );

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 mx-auto max-w-md border-t border-neutral-200 bg-neutral-0 px-3 py-2">
      <div className="flex items-center gap-2">
        {attachButton}
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
          className="min-w-0 flex-1 bg-transparent py-2 text-body-3 text-neutral-950 outline-none placeholder:text-neutral-500"
        />
        {sendButton}
      </div>
    </div>
  );
}
