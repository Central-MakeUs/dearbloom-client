'use client';

import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import type { University } from '@dearbloom/shared';
import { DeleteButton, Header, TextField } from '@dearbloom/ui';

export const getUniversityLabel = (university: University) => university.name;

interface UniversitySearchScreenProps {
  initialKeyword: string;
  onBack: () => void;
  onManualInput: (keyword: string) => void;
  onSelect: (university: University) => void;
}

export function UniversitySearchScreen({
  initialKeyword,
  onBack,
  onManualInput,
  onSelect,
}: UniversitySearchScreenProps) {
  const [keyword, setKeyword] = useState(initialKeyword);
  const [hasSearched, setHasSearched] = useState(false);
  const [universities, setUniversities] = useState<University[]>([]);

  useEffect(() => {
    const trimmedKeyword = keyword.trim();
    setHasSearched(false);
    if (!trimmedKeyword) {
      setUniversities([]);
      return;
    }

    const controller = new AbortController();
    fetch(`/app/api/universities?keyword=${encodeURIComponent(trimmedKeyword)}`, {
      signal: controller.signal,
    })
      .then((response) => response.json() as Promise<University[]>)
      .then((result) => {
        setUniversities(result);
        setHasSearched(true);
      })
      .catch((fetchError: unknown) => {
        if (!(fetchError instanceof DOMException && fetchError.name === 'AbortError')) {
          setUniversities([]);
          setHasSearched(true);
        }
      });

    return () => controller.abort();
  }, [keyword]);

  const resultList = universities.map((university) => {
    const label = getUniversityLabel(university);
    const matchStart = label.toLowerCase().indexOf(keyword.trim().toLowerCase());
    const matchEnd = matchStart + keyword.trim().length;
    const universityName =
      matchStart < 0 ? (
        label
      ) : (
        <>
          {label.slice(0, matchStart)}
          <mark className="bg-transparent text-primary">{label.slice(matchStart, matchEnd)}</mark>
          {label.slice(matchEnd)}
        </>
      );

    return (
      <li key={university.universityId}>
        <button
          className="w-full border-b border-neutral-200 px-4 py-3 text-left active:bg-neutral-200"
          onClick={() => onSelect(university)}
          type="button"
        >
          <p className="text-body-4 text-neutral-800">{universityName}</p>
          <p className="mt-1 text-caption-2 text-neutral-600">{university.address}</p>
        </button>
      </li>
    );
  });

  const searchTrailing = keyword ? (
    <DeleteButton onClick={() => setKeyword('')} />
  ) : (
    <Search aria-hidden className="text-neutral-500" size={20} strokeWidth={1.8} />
  );

  const manualInputButton = hasSearched ? (
    <div className="mt-3 flex w-full justify-center px-4">
      <button
        className="flex h-[72px] w-full flex-col items-center justify-center rounded-md border border-neutral-200 bg-neutral-0 text-center"
        onClick={() => onManualInput(keyword.trim())}
        type="button"
      >
        <span className="block text-caption-2 text-neutral-600">찾으시는 학교가 없나요?</span>
        <span className="mt-1 block text-body-5 text-primary">학교명 직접 입력하기</span>
      </button>
    </div>
  ) : null;

  const searchResult = !hasSearched ? null : universities.length === 0 ? (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <p className="text-body-4 text-neutral-900">검색 결과가 없어요</p>
        <p className="mt-1 text-caption-2 text-neutral-600">
          학교명을 다시 한번 확인해
          <br />
          보세요.
        </p>
      </div>
    </div>
  ) : (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <ul>{resultList}</ul>
    </div>
  );

  return (
    <main className="min-h-dvh bg-neutral-100">
      <div className="mx-auto flex min-h-dvh max-w-[375px] flex-col overflow-hidden">
        <Header onBack={onBack} title="학교명 검색" />
        <div className="px-4 pt-3">
          <TextField
            aria-label="학교명 검색"
            autoComplete="off"
            autoFocus
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="학교명을 검색하세요"
            trailing={searchTrailing}
            value={keyword}
          />
        </div>
        {manualInputButton}
        {searchResult}
      </div>
    </main>
  );
}
