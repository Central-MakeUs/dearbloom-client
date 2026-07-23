'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header, BottomButton } from '@dearbloom/ui';
import { useBoardStore } from '@/src/stores/boardStore';

export default function NewBoardPage() {
  const router = useRouter();
  const createBoard = useBoardStore((s) => s.createBoard);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [copied, setCopied] = useState(false);

  // 공유 코드는 클라이언트에서 생성(SSR 불일치 방지).
  useEffect(() => setCode(`#${Math.floor(100000 + Math.random() * 900000)}`), []);

  const shareUrl = `dearbloom.co.kr/boards/${code.replace('#', '')}`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // 클립보드 미지원 환경은 무시.
    }
  };

  const submit = () => {
    const board = createBoard(name, code || undefined);
    router.replace(`/boards/${board.id}`);
  };

  const nameField = (
    <div className="px-4 pt-4">
      <label htmlFor="board-name" className="mb-1 block text-body-4 text-neutral-700">
        보드 이름
      </label>
      <input
        id="board-name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="예: 우정스냅 보드"
        maxLength={20}
        className="w-full rounded-md border border-neutral-200 bg-neutral-0 px-4 py-3 text-body-3 text-neutral-950 outline-none focus:border-primary"
      />
    </div>
  );

  const urlField = (
    <div className="px-4 pt-6">
      <p className="mb-1 text-body-4 text-neutral-700">공동보드 URL</p>
      <div className="flex items-center gap-2 rounded-md border border-neutral-200 bg-neutral-0 px-4 py-3">
        <span className="min-w-0 flex-1 truncate text-body-3 text-neutral-950">{code || '#------'}</span>
        <button type="button" onClick={copy} className="shrink-0 rounded-md bg-neutral-100 px-3 py-1.5 text-body-4 text-primary">
          {copied ? '복사됨' : '복사'}
        </button>
      </div>
    </div>
  );

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col bg-neutral-100">
      <Header showBack onBack={() => router.back()} title="공동보드 생성하기" />
      {nameField}
      {urlField}
      <div className="flex-1" />
      <div className="sticky bottom-0 flex gap-2 bg-neutral-100 px-4 pb-6 pt-3">
        <BottomButton onClick={submit}>완료</BottomButton>
      </div>
    </div>
  );
}
