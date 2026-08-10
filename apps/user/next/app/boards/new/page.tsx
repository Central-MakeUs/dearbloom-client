'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header, BottomButton, TextField, cn } from '@dearbloom/ui';
import { useBoardStore } from '@/src/stores/boardStore';
import { BOARD_NAME_MAX_LENGTH, getBoardNameError, getBoardNameLength } from '@/src/lib/boardName';

export default function NewBoardPage() {
  const router = useRouter();
  const createBoard = useBoardStore((s) => s.createBoard);
  const [name, setName] = useState('');
  const [touched, setTouched] = useState(false);
  const error = getBoardNameError(name, touched);
  const nameLength = getBoardNameLength(name);
  const valid = !!name.trim() && nameLength <= BOARD_NAME_MAX_LENGTH;

  const submit = () => {
    setTouched(true);
    if (!valid) return;
    const board = createBoard(name);
    router.replace(`/boards/${board.id}`);
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
      <div className={cn('mt-1.5 flex justify-between text-caption-2', error ? 'text-danger' : 'text-neutral-500')}>
        <span>{error ?? (name ? '' : `최대 ${BOARD_NAME_MAX_LENGTH}자까지 입력할 수 있어요`)}</span>
        <span>{nameLength}/{BOARD_NAME_MAX_LENGTH}</span>
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
        <BottomButton type="submit" color="black" disabled={!valid}>
          완료
        </BottomButton>
      </div>
    </form>
  );
}
