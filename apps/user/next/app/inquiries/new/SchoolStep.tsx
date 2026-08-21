'use client';

import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { BottomButton, TextField, cn } from '@dearbloom/ui';
import type { University } from '@dearbloom/shared';

export interface SchoolValue {
  /** 대학 목록에서 고른 경우 */
  universityId?: number;
  /** 화면 표시용 이름 — 목록 선택/자율 입력 모두 채운다. */
  schoolName: string;
  /** 자율 입력으로 확정했는지(전송 시 universityId 대신 schoolName 을 보냄) */
  freeform: boolean;
}

interface SchoolStepProps {
  value: SchoolValue;
  onChange: (next: SchoolValue) => void;
  onNext: () => void;
}

/** 2단계 — 촬영 학교. 대학 검색으로 고르거나, 목록에 없으면 직접 입력한다(둘 중 하나). */
export function SchoolStep({ value, onChange, onNext }: SchoolStepProps) {
  const [keyword, setKeyword] = useState(value.freeform ? '' : value.schoolName);
  const [results, setResults] = useState<University[]>([]);
  const [freeformInput, setFreeformInput] = useState(value.freeform ? value.schoolName : '');

  // 선택 직후에는 재검색하지 않는다(선택한 이름이 그대로 keyword 가 되어 목록이 다시 열리는 것 방지).
  const picked = !value.freeform && value.schoolName === keyword && keyword.length > 0;

  useEffect(() => {
    const trimmed = keyword.trim();
    if (trimmed.length === 0 || picked) {
      setResults([]);
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/app/api/universities?keyword=${encodeURIComponent(trimmed)}`, {
          signal: controller.signal,
        });
        setResults(res.ok ? ((await res.json()) as University[]) : []);
      } catch {
        // 입력 중 취소된 요청 — 무시
      }
    }, 250);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [keyword, picked]);

  function pickUniversity(university: University) {
    setKeyword(university.name);
    setFreeformInput('');
    setResults([]);
    onChange({ universityId: university.universityId, schoolName: university.name, freeform: false });
  }

  function typeFreeform(next: string) {
    setFreeformInput(next);
    setKeyword('');
    setResults([]);
    onChange({ schoolName: next, freeform: true });
  }

  const searchField = (
    <div className="flex flex-col gap-2">
      <TextField
        id="school-search"
        label="학교명 검색"
        value={keyword}
        onChange={(e) => {
          setKeyword(e.target.value);
          if (value.universityId) onChange({ schoolName: '', freeform: false });
        }}
        placeholder="학교명을 검색하세요"
        trailing={<Search size={22} strokeWidth={2} className="text-neutral-500" aria-hidden />}
      />
      {results.length > 0 && (
        <ul className="overflow-hidden rounded-md bg-neutral-0">
          {results.map((university) => (
            <li key={university.universityId}>
              <button
                type="button"
                onClick={() => pickUniversity(university)}
                className="w-full px-4 py-3 text-left hover:bg-neutral-100"
              >
                <span className="block text-body-5 text-neutral-950">{university.name}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );

  const freeformField = (
    <TextField
      id="school-freeform"
      label="학교 자율 입력"
      value={freeformInput}
      onChange={(e) => typeFreeform(e.target.value)}
      placeholder="학교명을 입력하세요"
    />
  );

  const canGoNext = value.schoolName.trim().length > 0;

  return (
    <>
      <div className={cn('flex flex-col gap-6 px-4 pb-28 pt-4')}>
        <h2 className="text-body-3 text-neutral-950">촬영 학교를 선택해 주세요.</h2>
        {searchField}
        {freeformField}
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 mx-auto max-w-md bg-neutral-100 p-4">
        <BottomButton onClick={onNext} disabled={!canGoNext}>
          다음
        </BottomButton>
      </div>
    </>
  );
}
