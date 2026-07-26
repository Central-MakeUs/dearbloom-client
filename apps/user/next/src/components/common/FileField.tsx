'use client';

import { useRef, useState } from 'react';

/**
 * 네이티브 file input의 영어 라벨(Choose Files / No file chosen) 대신
 * 한국어 트리거 버튼 + 선택 상태 텍스트를 보여주는 파일 선택 필드.
 * 실제 <input type="file"> 은 숨기고 버튼 클릭으로 파일 대화상자를 엽니다.
 */
export function FileField({
  accept,
  multiple = false,
  buttonLabel = '파일 선택',
  emptyText = '선택된 파일 없음',
  onFiles,
  ariaLabel,
}: {
  accept?: string;
  multiple?: boolean;
  buttonLabel?: string;
  emptyText?: string;
  onFiles: (files: File[]) => void;
  ariaLabel?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [names, setNames] = useState<string[]>([]);

  const summary = names.length === 0 ? emptyText : names.length === 1 ? names[0] : `${names.length}개 선택됨`;

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="shrink-0 rounded-md border border-neutral-300 bg-neutral-0 px-3 py-2 text-body-5 text-neutral-800 hover:bg-neutral-100"
      >
        {buttonLabel}
      </button>
      <span className={`min-w-0 flex-1 truncate text-body-5 ${names.length ? 'text-neutral-950' : 'text-neutral-400'}`}>
        {summary}
      </span>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        aria-label={ariaLabel ?? buttonLabel}
        className="hidden"
        onChange={(e) => {
          const files = Array.from(e.target.files ?? []);
          setNames(files.map((f) => f.name));
          onFiles(files);
        }}
      />
    </div>
  );
}
