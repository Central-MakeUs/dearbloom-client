'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { BottomButton, Header, TextField, cn } from '@dearbloom/ui';
import {
  BOARD_NAME_MAX_LENGTH,
  BOARD_NAME_MIN_LENGTH,
  getBoardNameLength,
  isValidBoardName,
} from '@/src/lib/boardName';

interface BoardNameResponse {
  sharedBoardName: string;
}

export default function EditBoardNamePage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [initialName, setInitialName] = useState('');
  const [name, setName] = useState('');
  const [loaded, setLoaded] = useState(false);
  const [touched, setTouched] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const nameLength = getBoardNameLength(name);
  const trimmedName = name.trim();
  const valid = isValidBoardName(name);
  const changed = trimmedName !== initialName;
  const error =
    nameLength > BOARD_NAME_MAX_LENGTH
      ? `최대 ${BOARD_NAME_MAX_LENGTH}자까지 입력할 수 있어요`
      : touched && trimmedName.length === 0
        ? '공동보드 이름을 입력하세요'
        : touched && trimmedName.length < BOARD_NAME_MIN_LENGTH
          ? `최소 ${BOARD_NAME_MIN_LENGTH}자 이상 입력하세요`
          : undefined;

  useEffect(() => {
    let active = true;
    fetch(`/app/api/boards/${id}`)
      .then(async (response) => {
        if (!response.ok) throw new Error('공동보드 조회 실패');
        return response.json() as Promise<BoardNameResponse>;
      })
      .then((board) => {
        if (!active) return;
        setInitialName(board.sharedBoardName);
        setName(board.sharedBoardName);
      })
      .catch(() => router.replace(`/boards/${id}`))
      .finally(() => {
        if (active) setLoaded(true);
      });
    return () => {
      active = false;
    };
  }, [id, router]);

  const submit = async () => {
    setTouched(true);
    if (!valid || !changed || submitting) return;
    setSubmitting(true);
    const response = await fetch(`/app/api/boards/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sharedBoardName: trimmedName }),
    });
    if (!response.ok) {
      setSubmitting(false);
      return;
    }
    router.replace(`/boards/${id}?boardRenamed=1`);
  };

  const nameField = (
    <div className="px-4 pt-5">
      <TextField
        id="board-name"
        label={<span className="font-semibold">공동보드 이름</span>}
        value={name}
        onChange={(event) => setName(event.target.value)}
        onBlur={() => setTouched(true)}
        onClear={() => {
          setName('');
          setTouched(true);
        }}
        error={!!error}
        aria-invalid={!!error}
        disabled={!loaded}
      />
      <div
        className={cn(
          'mt-1.5 flex justify-between text-caption-2',
          error ? 'text-danger' : 'text-neutral-500',
        )}
      >
        <span>{error}</span>
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
      <Header showBack onBack={() => router.back()} title="보드 이름 변경하기" />
      {nameField}
      <div className="flex-1" />
      <div className="sticky bottom-0 bg-neutral-100 px-4 pb-6 pt-2">
        <BottomButton
          type="submit"
          color="black"
          disabled={!loaded || !valid || !changed || submitting}
        >
          완료
        </BottomButton>
      </div>
    </form>
  );
}
