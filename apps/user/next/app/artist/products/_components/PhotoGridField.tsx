'use client';

import { useEffect, useRef, useState } from 'react';
import { Check, Plus, School, X } from 'lucide-react';
import { Button, Input, cn } from '@dearbloom/ui';
import type { University } from '@dearbloom/shared';

/** 사진 1건 + 사진별 촬영 학교(선택). 새 사진은 file, 기존 사진은 fileUrl 을 가진다. */
export interface PhotoItem {
  id: string;
  previewUrl: string;
  file: File | null;
  fileUrl: string | null;
  universityId: number | null;
  uniName: string | null;
}

let idCounter = 0;
const nextId = () => `p${(idCounter += 1)}`;

export function photoFromFile(file: File): PhotoItem {
  return { id: nextId(), previewUrl: URL.createObjectURL(file), file, fileUrl: null, universityId: null, uniName: null };
}

export function photoFromUrl(fileUrl: string, universityId: number | null, uniName: string | null): PhotoItem {
  return { id: nextId(), previewUrl: fileUrl, file: null, fileUrl, universityId, uniName };
}

/** 작품 등록·수정 공용: 사진 추가/삭제, 사진별 학교 지정(개별 또는 다중선택 일괄).
 *
 *  다중선택은 사진을 탭해서 켜고 끈다. 예전에는 그리드를 드래그해 훑는 방식이었는데,
 *  터치에서 드래그가 페이지 스크롤과 같이 먹혀 선택이 마음대로 되지 않았다(QA). */
export function PhotoGridField({ value, onChange }: { value: PhotoItem[]; onChange: (photos: PhotoItem[]) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [assignTarget, setAssignTarget] = useState<string[] | null>(null);
  const [uniQuery, setUniQuery] = useState('');
  const [uniResults, setUniResults] = useState<University[]>([]);

  const clearSelection = () => setSelected(new Set());

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const add = (files: File[]) => onChange([...value, ...files.map(photoFromFile)]);
  const remove = (id: string) => {
    const t = value.find((p) => p.id === id);
    if (t?.file) URL.revokeObjectURL(t.previewUrl);
    onChange(value.filter((p) => p.id !== id));
    setSelected((prev) => {
      const n = new Set(prev);
      n.delete(id);
      return n;
    });
  };

  // 한 글자마다 바로 쏘면 늦게 도착한 응답이 최신 결과를 덮어써, 뜸을 들이고 이전 요청은 취소한다.
  useEffect(() => {
    const trimmed = uniQuery.trim();
    if (trimmed.length === 0) {
      setUniResults([]);
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/app/api/universities?keyword=${encodeURIComponent(trimmed)}`, { signal: controller.signal });
        setUniResults(res.ok ? ((await res.json()) as University[]) : []);
      } catch {
        // 입력 중 취소된 요청 — 무시
      }
    }, 250);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [uniQuery]);

  const openAssign = (ids: string[]) => {
    if (!ids.length) return;
    setAssignTarget(ids);
    setUniQuery('');
    setUniResults([]);
  };
  const assign = (u: University) => {
    if (!assignTarget) return;
    const set = new Set(assignTarget);
    onChange(value.map((p) => (set.has(p.id) ? { ...p, universityId: u.universityId, uniName: u.name } : p)));
    setAssignTarget(null);
    clearSelection();
  };
  const clearUni = (id: string) => onChange(value.map((p) => (p.id === id ? { ...p, universityId: null, uniName: null } : p)));

  const grid = value.length > 0 && (
    <div className="mt-2 grid select-none grid-cols-3 gap-2">
      {value.map((p) => {
        const on = selected.has(p.id);
        return (
          <div key={p.id} className="relative">
            <button
              type="button"
              onClick={() => toggle(p.id)}
              aria-pressed={on}
              aria-label={`첨부 사진 ${on ? '선택 해제' : '선택'}`}
              className={cn(
                'relative block w-full overflow-hidden rounded-md border',
                on ? 'border-primary ring-2 ring-primary/40' : 'border-neutral-200',
              )}
            >
              <img src={p.previewUrl} alt="" className="pointer-events-none aspect-square w-full object-cover" />
              <span
                aria-hidden
                className={cn(
                  'absolute left-1 top-1 grid size-5 place-items-center rounded-full border',
                  on ? 'border-primary bg-primary text-neutral-0' : 'border-neutral-0/80 bg-neutral-900/30 text-transparent',
                )}
              >
                <Check className="size-3.5" strokeWidth={3} />
              </span>
            </button>
            <button
              type="button"
              onClick={() => remove(p.id)}
              aria-label="사진 삭제"
              className="absolute right-1 top-1 grid size-5 place-items-center rounded-full bg-neutral-900/60 text-neutral-0"
            >
              <X className="size-3.5" />
            </button>
            <button
              type="button"
              onClick={() => (p.universityId ? clearUni(p.id) : openAssign([p.id]))}
              className="mt-0.5 flex w-full items-center justify-center gap-1 truncate rounded-b-md bg-neutral-0 px-1 py-1.5 text-caption-2 text-neutral-700"
            >
              {p.uniName ? (
                <>
                  <School className="size-3.5 shrink-0" /> <span className="truncate">{p.uniName}</span> <X className="size-3 shrink-0" />
                </>
              ) : (
                <>
                  <Plus className="size-3.5" /> 학교 지정
                </>
              )}
            </button>
          </div>
        );
      })}
    </div>
  );

  const assignPanel = assignTarget && (
    <div className="mt-2 rounded-md border border-primary bg-primary-50 p-2">
      <div className="mb-1 flex items-center justify-between">
        <span className="text-caption-1 text-neutral-700">사진 {assignTarget.length}장에 학교 지정</span>
        <button type="button" onClick={() => setAssignTarget(null)} className="text-caption-1 text-neutral-500 underline">
          닫기
        </button>
      </div>
      <Input value={uniQuery} onChange={(e) => setUniQuery(e.target.value)} placeholder="학교명 검색" autoComplete="off" autoFocus />
      {uniResults.length > 0 && (
        <ul className="mt-1 max-h-48 overflow-y-auto rounded-md border border-neutral-200 bg-neutral-0">
          {uniResults.map((u) => (
            <li key={u.universityId}>
              <button
                type="button"
                className="w-full px-3 py-2 text-left hover:bg-neutral-100"
                onClick={() => assign(u)}
              >
                <span className="truncate text-body-5 text-neutral-950">{u.name}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );

  return (
    <div>
      <div className="flex items-center justify-between">
        <Button type="button" variant="outline" size="sm" onClick={() => inputRef.current?.click()}>
          <Plus className="size-4" /> 사진 추가
        </Button>
        {value.length > 0 && <span className="text-caption-2 text-neutral-400">사진을 탭해 여러 장 선택</span>}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          add(Array.from(e.target.files ?? []));
          e.target.value = '';
        }}
      />
      {grid}
      {selected.size > 0 && (
        <div className="mt-2 flex items-center justify-between">
          <span className="text-caption-1 text-neutral-600">{selected.size}장 선택됨</span>
          <div className="flex gap-1.5">
            <Button type="button" variant="ghost" size="sm" onClick={clearSelection}>
              선택 해제
            </Button>
            <Button type="button" variant="secondary" size="sm" onClick={() => openAssign([...selected])}>
              선택한 사진에 학교 지정
            </Button>
          </div>
        </div>
      )}
      {assignPanel}
    </div>
  );
}
