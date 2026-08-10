import { useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { BottomSheet } from '@dearbloom/ui';
import type { ArtworkSortOrder } from '@dearbloom/shared';
import { SORT_OPTIONS, sortLabel } from '@/lib/artworkFilter';

interface Props {
  current: ArtworkSortOrder;
  /** 정렬을 뺀 현재 필터 쿼리('region=SEOUL' 형태, 앞의 ? 없음). */
  filterQuery: string;
}

/**
 * 정렬 선택 — 트리거(추천순 ▾) + 바텀시트. Figma 1062:18147 실측.
 * 고른 값은 URL 로 반영해 페이지를 다시 받습니다. 커서가 초기화돼야 정렬이 섞이지 않습니다.
 */
export function ArtworkSortSheet({ current, filterQuery }: Props) {
  const [open, setOpen] = useState(false);

  const apply = (sort: ArtworkSortOrder) => {
    const q = new URLSearchParams(filterQuery);
    if (sort === 'LATEST') q.delete('sort');
    else q.set('sort', sort);
    window.location.href = `/snaps${q.size > 0 ? `?${q}` : ''}`;
  };

  const trigger = (
    <button
      type="button"
      onClick={() => setOpen(true)}
      className="flex items-center p-1 text-body-5 text-neutral-800"
    >
      {sortLabel(current)}
      <ChevronDown size={24} strokeWidth={1.5} className="text-neutral-700" aria-hidden />
    </button>
  );

  const options = SORT_OPTIONS.map((option, i) => {
    const selected = option.value === current;
    const radio = selected ? (
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary">
        <Check size={18} strokeWidth={1.5} className="text-neutral-0" aria-hidden />
      </span>
    ) : (
      <span className="h-[22px] w-[22px] rounded-full border-[1.5px] border-neutral-600" aria-hidden />
    );

    // Figma 1110:20896 — 항목 24px, 구분선까지 위아래 16px. 첫 항목만 위 여백이 없다.
    return (
      <button
        key={option.value}
        type="button"
        onClick={() => apply(option.value)}
        aria-pressed={selected}
        className={`flex w-full items-center justify-between px-[15px] py-4 text-body-1 text-neutral-900 ${
          i > 0 ? 'border-t border-neutral-200' : 'pt-0'
        }`}
      >
        {option.label}
        {radio}
      </button>
    );
  });

  return (
    <>
      {trigger}
      <BottomSheet open={open} onOpenChange={setOpen} title="정렬 설정" className="rounded-t-lg">
        {/* 핸들 아래 20px, 타이틀 아래 28px — 시트 기본 마진(8px)을 감안해 pt 로 보정. */}
        <p className="pb-7 pt-3 text-center text-head-3 text-neutral-950">정렬 설정</p>
        <div className="px-2">{options}</div>
      </BottomSheet>
    </>
  );
}
