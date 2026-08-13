'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header, BottomButton, Spinner, TextField, cn } from '@dearbloom/ui';
import {
  BOARD_NAME_MAX_LENGTH,
  getBoardNameError,
  getBoardNameLength,
  isValidBoardName,
} from '@/src/lib/boardName';

export default function NewBoardPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [touched, setTouched] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const error = getBoardNameError(name, touched);
  const nameLength = getBoardNameLength(name);
  const valid = isValidBoardName(name);

  const submit = async () => {
    setTouched(true);
    if (!valid || submitting) return;
    setSubmitting(true);
    try {
      const response = await fetch('/app/api/boards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sharedBoardName: name.trim() }),
      });
      if (response.status === 401) {
        window.location.href = `/app/login?returnUrl=${encodeURIComponent('/app/boards/new')}`;
        return;
      }
      if (!response.ok) throw new Error('공동보드 생성 실패');
      const board = (await response.json()) as { sharedBoardId: number };
      router.replace(`/boards/${board.sharedBoardId}`);
    } catch {
      setSubmitting(false);
    }
  };

  const nameField = (
    <div className="px-4 pt-5">
      <TextField
        id="board-name"
        label="공동보드 이름"
        value={name}
        onChange={(event) => setName(event.target.value)}
        onBlur={() => setTouched(true)}
        onClear={() => setName('')}
        placeholder="공동보드 이름을 입력하세요"
        error={!!error}
        aria-invalid={!!error}
      />
      <div
        className={cn(
          'mt-1.5 flex justify-between text-caption-2',
          error ? 'text-danger' : 'text-neutral-500',
        )}
      >
        <span>{error ?? (name ? '' : `최대 ${BOARD_NAME_MAX_LENGTH}자까지 입력할 수 있어요`)}</span>
        <span>
          {nameLength}/{BOARD_NAME_MAX_LENGTH}
        </span>
      </div>
    </div>
  );

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
      className="mx-auto flex min-h-screen max-w-md flex-col bg-neutral-100"
    >
      <Header showBack onBack={() => router.back()} title="공동보드 만들기" />
      {nameField}
      <div className="flex-1" />
      <div className="sticky bottom-0 bg-neutral-100 px-4 pb-6 pt-2">
        <BottomButton type="submit" color="black" disabled={!valid || submitting}>
          {submitting ? <Spinner className="size-5 text-current" label="" /> : null}
          완료
        </BottomButton>
      </div>
    </form>
  );
}
