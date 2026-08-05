'use client';

import { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { cn } from '@dearbloom/ui';
import {
  ampmTimeLabel,
  compactDateLabel,
  shortDateLabel,
  type CustomerInquiryListItem,
  type InquiryStatus,
} from '@dearbloom/shared';

type TabKey = 'inquiry' | 'canceled';

interface Filter {
  key: string;
  label: string;
  /** null 이면 그 탭 전체. */
  status: InquiryStatus | null;
}

const TABS: { key: TabKey; label: string; filters: Filter[]; emptyByFilter: Record<string, string> }[] = [
  {
    key: 'inquiry',
    label: '문의내역',
    filters: [
      { key: 'all', label: '전체', status: null },
      { key: 'progress', label: '진행중', status: 'IN_PROGRESS' },
      { key: 'reserved', label: '예약완료', status: 'RESERVED' },
    ],
    emptyByFilter: {
      all: '문의 내역이 없어요',
      progress: '진행 중인 문의가 없어요',
      reserved: '예약 완료된 문의가 없어요',
    },
  },
  {
    key: 'canceled',
    label: '취소내역',
    filters: [
      { key: 'all', label: '전체', status: null },
      { key: 'inquiry-canceled', label: '문의취소', status: 'INQUIRY_CANCELED' },
      { key: 'reservation-canceled', label: '예약취소', status: 'RESERVATION_CANCELED' },
    ],
    emptyByFilter: {
      all: '취소 내역이 없어요',
      'inquiry-canceled': '취소한 문의가 없어요',
      'reservation-canceled': '취소된 예약이 없어요',
    },
  },
];

const CANCELED: InquiryStatus[] = ['INQUIRY_CANCELED', 'RESERVATION_CANCELED'];

/** 문의 내역 — 문의내역/취소내역 탭 + 상태 칩. 목록은 한 번에 받아 클라이언트에서 거른다. */
export function InquiryHistoryList({ items }: { items: CustomerInquiryListItem[] }) {
  const [tabKey, setTabKey] = useState<TabKey>('inquiry');
  const [filterKey, setFilterKey] = useState('all');

  const tab = TABS.find((t) => t.key === tabKey)!;
  const filter = tab.filters.find((f) => f.key === filterKey) ?? tab.filters[0]!;

  const inTab = items.filter((it) =>
    tabKey === 'canceled' ? CANCELED.includes(it.status) : !CANCELED.includes(it.status),
  );
  const shown = filter.status ? inTab.filter((it) => it.status === filter.status) : inTab;

  function selectTab(key: TabKey) {
    setTabKey(key);
    setFilterKey('all');
  }

  const tabBar = (
    <div className="flex border-b border-neutral-200">
      {TABS.map((t) => (
        <button
          key={t.key}
          type="button"
          onClick={() => selectTab(t.key)}
          className={cn(
            'flex-1 border-b-2 py-3 text-body-3 transition-colors',
            t.key === tabKey ? 'border-primary text-primary' : 'border-transparent text-neutral-600',
          )}
        >
          {t.label}
        </button>
      ))}
    </div>
  );

  const chips = (
    <div className="flex gap-2 px-4 py-3">
      {tab.filters.map((f) => (
        <button
          key={f.key}
          type="button"
          onClick={() => setFilterKey(f.key)}
          className={cn(
            'rounded-full border px-4 py-2 text-body-5 transition-colors',
            f.key === filter.key
              ? 'border-primary bg-primary text-neutral-0'
              : 'border-neutral-300 bg-transparent text-neutral-700',
          )}
        >
          {f.label}
        </button>
      ))}
    </div>
  );

  const list =
    shown.length === 0 ? (
      <p className="px-6 py-32 text-center text-body-3 text-neutral-950">
        {tab.emptyByFilter[filter.key]}
      </p>
    ) : (
      <ul className="flex flex-col gap-3 px-4 pb-4">
        {shown.map((it) => (
          <li key={it.inquiryId}>
            <a
              href={`/app/my/reservations/${it.inquiryId}`}
              className="block rounded-lg bg-neutral-0 p-4"
            >
              <div className="flex items-center gap-2">
                <span className="text-body-3 font-semibold text-neutral-950">{it.statusLabel}</span>
                <span className="text-body-5 text-neutral-500">{compactDateLabel(it.requestedAt)} 문의</span>
                <ChevronRight size={20} strokeWidth={2} className="ml-auto text-neutral-400" aria-hidden />
              </div>
              <div className="mt-3 flex gap-3">
                <img
                  src={it.artworkImageUrl}
                  alt=""
                  className="h-[76px] w-[76px] shrink-0 rounded-md object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-body-3 font-semibold text-neutral-950">{it.artworkName}</p>
                  <p className="mt-0.5 truncate text-body-5 text-neutral-500">{it.artistNickname}</p>
                  <p className="mt-2 text-body-4 text-neutral-950">
                    {shortDateLabel(it.shootDate)} <span className="text-neutral-300">|</span>{' '}
                    {ampmTimeLabel(it.startTime)}
                  </p>
                  <p className="mt-0.5 text-body-4 text-neutral-950">{it.packageName}</p>
                </div>
              </div>
            </a>
          </li>
        ))}
      </ul>
    );

  return (
    <>
      {tabBar}
      {chips}
      {list}
    </>
  );
}
