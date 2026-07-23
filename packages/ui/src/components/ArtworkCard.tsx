'use client';

import { cn } from '../lib/cn';
import { SaveHeart } from './SaveHeart';

export interface ArtworkCardProps {
  artworkId: number;
  title: string;
  artistNickname: string;
  price: number;
  thumbnailUrl?: string | null;
  /** 이미 한글로 변환된 지역 라벨 목록(칩으로 렌더). 예: ['서울','경기'] */
  regions?: string[];
  /** 상세 링크. 기본 `/snaps/{artworkId}`. */
  href?: string;

  // ── 저장(하트) — 기본(표시) 모드 ──
  initialSaved?: boolean;
  /** 저장 프록시 엔드포인트(앱별 basePath 대응). SaveHeart 로 전달. */
  saveEndpoint?: string;
  onSavedChange?: (saved: boolean) => void;

  // ── 선택(편집) 모드 — selectable 이면 하트 대신 체크, 카드 전체가 선택 토글 ──
  selectable?: boolean;
  selected?: boolean;
  onSelect?: () => void;

  className?: string;
}

const formatPrice = (won: number) => `${Math.round(won / 10000).toLocaleString()}만원`;

/**
 * 작품 카드 — 탐색 피드/내 저장 공용. 썸네일(4:5) + 제목 + 작가 + 가격(그린) + 지역 칩.
 * 기본 모드: 우하단 저장 하트 오버레이 + 상세 링크.
 * selectable 모드(편집): 우상단 선택 체크, 카드 전체가 선택 토글(링크 없음).
 */
export function ArtworkCard({
  artworkId,
  title,
  artistNickname,
  price,
  thumbnailUrl,
  regions,
  href,
  initialSaved = false,
  saveEndpoint,
  onSavedChange,
  selectable = false,
  selected = false,
  onSelect,
  className,
}: ArtworkCardProps) {
  const detailHref = href ?? `/snaps/${artworkId}`;

  const image = (
    <img
      src={thumbnailUrl ?? undefined}
      alt={title}
      loading="lazy"
      className="h-full w-full object-cover"
    />
  );

  const meta = (
    <div className="min-w-0">
      <div className="truncate text-body-4 text-neutral-950">{title}</div>
      <div className="mt-0.5 truncate text-body-6 text-neutral-600">{artistNickname}</div>
      <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
        <span className="text-body-1 font-semibold text-primary">{formatPrice(price)}</span>
        {regions?.map((r) => (
          <span key={r} className="rounded-sm bg-neutral-200 px-1.5 py-0.5 text-caption-2 text-neutral-700">
            {r}
          </span>
        ))}
      </div>
    </div>
  );

  // 편집(선택) 모드 — 우상단 체크 원, 카드 전체 토글
  if (selectable) {
    const checkCircle = (
      <span
        aria-hidden
        className={cn(
          'absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full border-2 transition-colors',
          selected ? 'border-neutral-950 bg-neutral-950 text-neutral-0' : 'border-neutral-0 bg-neutral-950/15',
        )}
      >
        {selected && (
          <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M20 6 9 17l-5-5" />
          </svg>
        )}
      </span>
    );

    return (
      <button type="button" onClick={onSelect} aria-pressed={selected} className={cn('flex flex-col text-left', className)}>
        <div className="relative mb-2 aspect-[4/5] overflow-hidden rounded-lg bg-neutral-200">
          {image}
          {checkCircle}
        </div>
        {meta}
      </button>
    );
  }

  // 표시 모드 — 상세 링크 + 우하단 저장 하트 오버레이
  return (
    <div className={cn('flex flex-col', className)}>
      <div className="relative mb-2">
        <a href={detailHref} className="block aspect-[4/5] overflow-hidden rounded-lg bg-neutral-200">
          {image}
        </a>
        <SaveHeart
          artworkId={artworkId}
          initialSaved={initialSaved}
          size={20}
          endpoint={saveEndpoint}
          onChange={onSavedChange}
          className="absolute bottom-2 right-2 flex h-9 w-9 items-center justify-center rounded-full bg-neutral-0/80 text-neutral-700 backdrop-blur transition-transform active:scale-90"
        />
      </div>
      <a href={detailHref} className="block">
        {meta}
      </a>
    </div>
  );
}
