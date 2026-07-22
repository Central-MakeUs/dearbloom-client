'use client';

import { useState } from 'react';

const MAX = 5;

export function EditForm({ initialName }: { initialName: string }) {
  const [name, setName] = useState(initialName.slice(0, MAX));

  const submit = () => {
    // TODO: 사용자 이름 수정 API 나오면 연결(현재 백엔드 부재). 지금은 마이로 복귀만.
    window.location.href = '/app/my';
  };

  return (
    <>
      {/* 입력 필드 */}
      <div className="flex flex-col gap-1.5 px-4 pt-4">
        <label htmlFor="username" className="text-body-4 text-neutral-950">
          사용자 이름
        </label>
        <div className="flex h-14 items-center gap-2 rounded-md bg-neutral-0 px-4">
          <input
            id="username"
            value={name}
            maxLength={MAX}
            onChange={(e) => setName(e.target.value)}
            className="min-w-0 flex-1 bg-transparent text-body-2 text-neutral-950 outline-none placeholder:text-neutral-400"
            placeholder="사용자 이름을 입력해주세요"
          />
          {name && (
            <button
              type="button"
              aria-label="지우기"
              onClick={() => setName('')}
              className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-neutral-300 text-neutral-0"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" aria-hidden>
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        <div className="flex justify-end">
          <span className="text-caption-2 text-neutral-500">
            {name.length}/{MAX}
          </span>
        </div>
      </div>

      {/* 하단 완료 버튼 */}
      <div className="mt-auto px-4 py-2">
        <button
          type="button"
          onClick={submit}
          disabled={name.trim().length === 0}
          className="h-[52px] w-full rounded-md bg-neutral-800 text-body-1 text-neutral-0 disabled:opacity-40"
        >
          완료
        </button>
      </div>
    </>
  );
}
