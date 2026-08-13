'use client';

import { cn } from '../lib/cn';
import { SaveHeart } from './SaveHeart';
import { RegionTag } from './ui/region-tag';
import { SkeletonImage } from './ui/skeleton';

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
    <SkeletonImage
      src={thumbnailUrl ?? undefined}
      alt={title}
      loading="lazy"
      className="aspect-[4/5] rounded-lg"
    />
  );

  // Figma 437:7469 실측 — 제목/작가 간격 0, 작가↔가격줄 4, 가격↔태그그룹 8, 태그끼리 4.
  const meta = (
    <div className="min-w-0">
      <div className="truncate text-body-3 text-neutral-900">{title}</div>
      <div className="truncate text-body-6 text-neutral-900">{artistNickname}</div>
      <div className="mt-1 flex flex-wrap items-center gap-2">
        <span className="text-body-3 text-primary">{formatPrice(price)}</span>
        {!!regions?.length && (
          <div className="flex flex-wrap items-center gap-1">
            {regions.map((r) => (
              <RegionTag key={r} size="sm">
                {r}
              </RegionTag>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  // 편집(선택) 모드 — 우상단 체크 원, 카드 전체 토글
  if (selectable) {
    const checkCircle = (
      <span aria-hidden className="absolute right-3 top-3 flex size-6 items-center justify-center">
        <img
          src={
            selected
              ? '/app/images/candidate-selected-circle.svg'
              : '/app/images/candidate-unselected-circle.svg'
          }
          alt=""
          className="absolute inset-0 size-6"
        />
        {selected && (
          <img
            src="/app/images/candidate-check.svg"
            alt=""
            className="relative h-[7.86px] w-[11.05px]"
          />
        )}
      </span>
    );

    return (
      <button type="button" onClick={onSelect} aria-pressed={selected} className={cn('flex flex-col text-left', className)}>
        <div className="relative mb-2">
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
        <a href={detailHref} className="block">
          {image}
        </a>
        <SaveHeart
          artworkId={artworkId}
          initialSaved={initialSaved}
          size={24}
          strokeWidth={1.5}
          endpoint={saveEndpoint}
          onChange={onSavedChange}
          className="absolute bottom-[9px] right-[9px] flex h-9 w-9 items-center justify-center rounded-full bg-neutral-950/30 text-neutral-0 transition-transform active:scale-90"
        />
      </div>
      <a href={detailHref} className="block">
        {meta}
      </a>
    </div>
  );
}
