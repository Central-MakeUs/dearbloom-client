'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronRight, User } from 'lucide-react';
import {
  ampmTimeLabel,
  compactDateLabel,
  shortDateLabel,
  type ArtistInquiryListItem,
  type InquiryStatus,
} from '@dearbloom/shared';
import { Badge, Card, cn, type BadgeProps } from '@dearbloom/ui';

type FilterKey = 'all' | 'progress' | 'reserved' | 'canceled';

const FILTERS: { key: FilterKey; label: string; empty: string }[] = [
  { key: 'all', label: '전체', empty: '받은 문의가 없어요.' },
  { key: 'progress', label: '진행중', empty: '진행 중인 문의가 없어요.' },
  { key: 'reserved', label: '예약완료', empty: '예약 완료된 문의가 없어요.' },
  { key: 'canceled', label: '취소', empty: '취소된 문의가 없어요.' },
];

const isCanceled = (s: InquiryStatus) => s === 'INQUIRY_CANCELED' || s === 'RESERVATION_CANCELED';

function matches(key: FilterKey, status: InquiryStatus): boolean {
  if (key === 'all') return true;
  if (key === 'progress') return status === 'IN_PROGRESS';
  if (key === 'reserved') return status === 'RESERVED';
  return isCanceled(status);
}

/** 문의 상태 → Badge variant */
const statusVariant = (status: InquiryStatus): BadgeProps['variant'] =>
  status === 'RESERVED' ? 'primary' : isCanceled(status) ? 'muted' : 'default';

/** 손이 가야 하는 문의부터 위로. 같은 묶음 안에서는 촬영이 임박한 순(취소는 최근 순). */
const priority = (s: InquiryStatus) => (s === 'IN_PROGRESS' ? 0 : s === 'RESERVED' ? 1 : 2);

function byUrgency(a: ArtistInquiryListItem, b: ArtistInquiryListItem): number {
  const gap = priority(a.status) - priority(b.status);
  if (gap !== 0) return gap;
  return isCanceled(a.status)
    ? b.shootDate.localeCompare(a.shootDate)
    : a.shootDate.localeCompare(b.shootDate);
}

/** 고객 프로필. 이름은 옆에 그대로 나오므로 이미지는 장식으로 둔다. */
function CustomerAvatar({ imageUrl }: { imageUrl: string | null }) {
  if (imageUrl) {
    return <img src={imageUrl} alt="" className="size-7 shrink-0 rounded-full object-cover" />;
  }
  return (
    <span
      aria-hidden
      className="flex size-7 shrink-0 items-center justify-center rounded-full bg-neutral-200 text-neutral-500"
    >
      <User size={16} strokeWidth={2} />
    </span>
  );
}

/**
 * 받은 문의 목록 — 상태 칩으로 거르고, 손이 가야 하는 문의를 위로 올린다.
 * 목록은 한 번에 받아 클라이언트에서 거른다(고객 문의 내역과 같은 방식).
 */
export function RequestList({ items }: { items: ArtistInquiryListItem[] }) {
  const [filterKey, setFilterKey] = useState<FilterKey>('all');

  const filter = FILTERS.find((f) => f.key === filterKey) ?? FILTERS[0]!;
  const shown = items.filter((it) => matches(filterKey, it.status)).sort(byUrgency);
  const countOf = (key: FilterKey) => items.filter((it) => matches(key, it.status)).length;

  const chips = (
    <div className="flex gap-2 overflow-x-auto px-4 py-3">
      {FILTERS.map((f) => (
        <button
          key={f.key}
          type="button"
          onClick={() => setFilterKey(f.key)}
          aria-pressed={f.key === filterKey}
          className={cn(
            'shrink-0 rounded-full border px-4 py-2 text-body-5 transition-colors',
            f.key === filterKey
              ? 'border-primary bg-primary text-neutral-0'
              : 'border-neutral-300 bg-transparent text-neutral-700',
          )}
        >
          {f.label} {countOf(f.key)}
        </button>
      ))}
    </div>
  );

  const card = (it: ArtistInquiryListItem) => (
    <Link
      href={`/artist/requests/${it.inquiryId}`}
      aria-label={`${it.customerName} 님의 ${it.artworkName} 문의, ${it.statusLabel}`}
      className="block"
    >
      <Card className="p-4 transition-colors hover:bg-neutral-100">
        <div className="flex items-center gap-2">
          <Badge variant={statusVariant(it.status)} className="shrink-0">
            {it.statusLabel}
          </Badge>
          <span className="truncate text-caption-1 text-neutral-500">
            {compactDateLabel(it.requestedAt)} 문의
          </span>
          <ChevronRight size={20} strokeWidth={2} className="ml-auto shrink-0 text-neutral-400" aria-hidden />
        </div>

        <div className="mt-2 flex items-center gap-2">
          <CustomerAvatar imageUrl={it.customerImageUrl} />
          <span className="truncate text-body-4 text-neutral-950">{it.customerName}</span>
          <span className="shrink-0 text-caption-1 text-neutral-500">{it.headCount}인</span>
        </div>

        <p className="mt-2 truncate text-body-5 text-neutral-700">{it.artworkName}</p>
        <p className="mt-0.5 truncate text-caption-1 text-neutral-500">
          {it.packageName} · {it.schoolName}
        </p>
        <p className="mt-2 text-body-4 text-neutral-950">
          {shortDateLabel(it.shootDate)} <span className="text-neutral-300">|</span>{' '}
          {ampmTimeLabel(it.startTime)}
        </p>
      </Card>
    </Link>
  );

  const list =
    shown.length === 0 ? (
      <p className="px-6 py-24 text-center text-body-5 text-neutral-500">{filter.empty}</p>
    ) : (
      <ul className="flex flex-col gap-2 px-4 pb-4">
        {shown.map((it) => (
          <li key={it.inquiryId}>{card(it)}</li>
        ))}
      </ul>
    );

  return (
    <>
      {chips}
      {list}
    </>
  );
}
