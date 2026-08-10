import { useEffect, useState } from 'react';
import { RotateCw } from 'lucide-react';
import { ScrollFade } from '@dearbloom/ui';
import {
  ARTIST_REGION_OPTIONS,
  ARTWORK_DATE_RANGE_MAX_DAYS,
  ARTWORK_HEAD_COUNT_MAX,
  type ArtistRegionCode,
  type ArtworkListParams,
} from '@dearbloom/shared';
import { daysBetween, toQueryString } from '@/lib/artworkFilter';
import { FilterCalendar, toDateKey } from './FilterCalendar';

const TABS = [
  { key: 'date', label: '날짜' },
  { key: 'region', label: '지역' },
  { key: 'headCount', label: '인원' },
] as const;

type TabKey = (typeof TABS)[number]['key'];

/** "오늘부터 N일" 빠른 선택. N 일에는 오늘이 포함됩니다. */
const QUICK_RANGES = [7, 14, ARTWORK_DATE_RANGE_MAX_DAYS] as const;

const HEAD_COUNTS = Array.from({ length: ARTWORK_HEAD_COUNT_MAX }, (_, i) => i + 1);

function addDays(dateKey: string, days: number): string {
  const [y, m, d] = dateKey.split('-').map(Number);
  const next = new Date(y!, m! - 1, d! + days);
  return toDateKey(next);
}

interface Props {
  /** 진입 시점의 필터(URL 에서 읽은 값). 취소하고 돌아가면 이 값이 그대로 유지됩니다. */
  initial: ArtworkListParams;
}

/**
 * 필터 설정 화면 — Figma 1062:17201 실측. 날짜·지역·인원을 한 스크롤에 두고 탭은 앵커로 씁니다.
 * 적용을 눌러야 URL 이 바뀌므로, 고르는 중에는 목록이 흔들리지 않습니다.
 */
export function FilterSettingsView({ initial }: Props) {
  const today = toDateKey(new Date());

  const [start, setStart] = useState<string | null>(initial.startDate ?? null);
  const [end, setEnd] = useState<string | null>(initial.endDate ?? null);
  const [region, setRegion] = useState<ArtistRegionCode | undefined>(initial.region);
  const [headCount, setHeadCount] = useState<number | undefined>(initial.headCount);
  const [month, setMonth] = useState(() => {
    const base = initial.startDate ? new Date(initial.startDate) : new Date();
    return new Date(base.getFullYear(), base.getMonth(), 1);
  });
  const [activeTab, setActiveTab] = useState<TabKey>('date');

  // 스크롤에 따라 탭이 따라오게 — 화면 상단에 걸린 섹션을 활성으로 봅니다.
  // 섹션은 마운트 시점에 셋 다 그려져 있고 사라지지 않으므로 id 로 찾아 한 번만 붙입니다.
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length > 0) setActiveTab(visible[0]!.target.id as TabKey);
      },
      // 상단 100px(헤더+탭바)은 가려진 영역이라 판정에서 뺍니다.
      { rootMargin: '-100px 0px -60% 0px' },
    );
    for (const tab of TABS) {
      const el = document.getElementById(tab.key);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, []);

  /**
   * 날짜 탭 규칙 — 첫 클릭은 시작일, 다음 클릭은 종료일. 이미 기간이 잡혀 있거나
   * 거꾸로/30일을 넘겨 찍으면 그 날짜를 새 시작일로 삼습니다(다시 찍는 게 자연스러움).
   */
  const selectDate = (date: string) => {
    if (start === null || end !== null || date < start || daysBetween(start, date) >= ARTWORK_DATE_RANGE_MAX_DAYS) {
      setStart(date);
      setEnd(null);
      return;
    }
    setEnd(date);
  };

  const selectQuickRange = (days: number) => {
    setStart(today);
    setEnd(addDays(today, days - 1));
    setMonth(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  };

  const reset = () => {
    setStart(null);
    setEnd(null);
    setRegion(undefined);
    setHeadCount(undefined);
  };

  const apply = () => {
    const params: ArtworkListParams = { sort: initial.sort };
    if (start) {
      params.startDate = start;
      // 시작만 고른 상태로 적용하면 그 하루로 봅니다(백엔드가 두 값을 항상 함께 요구).
      params.endDate = end ?? start;
    }
    if (region) params.region = region;
    if (headCount !== undefined) params.headCount = headCount;
    window.location.href = `/snaps${toQueryString(params)}`;
  };

  const scrollToSection = (key: TabKey) => {
    setActiveTab(key);
    document.getElementById(key)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const chipClass = (selected: boolean) =>
    `h-[33px] rounded-[20px] border-[1.2px] px-3 text-body-5 ${
      selected
        ? 'border-primary bg-primary-200 font-semibold text-primary'
        : 'border-transparent bg-neutral-200 text-neutral-800'
    }`;

  // 헤더가 fixed 52px 이므로 탭바는 그 아래에 붙인다(top-0 이면 헤더 뒤로 깔려 사라진다).
  const tabBar = (
    <div className="sticky top-[52px] z-30 flex h-12 bg-neutral-100">
      {TABS.map((tab) => {
        const active = tab.key === activeTab;
        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => scrollToSection(tab.key)}
            className={`flex-1 border-b ${
              active ? 'border-primary text-head-3 text-primary' : 'border-neutral-400 text-body-1 text-neutral-700'
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );

  const sectionHeading = (title: string, description: string) => (
    <div className="flex flex-col gap-2">
      <h2 className="text-head-3 font-bold text-neutral-900">{title}</h2>
      <p className="text-body-6 text-neutral-600">{description}</p>
    </div>
  );

  const dateSection = (
    <section id="date" className="flex scroll-mt-[100px] flex-col gap-5 px-4">
      {sectionHeading('날짜 설정', '설정한 날짜에 예약 가능한 곳만 볼 수 있어요.')}
      <FilterCalendar
        month={month}
        onMonthChange={setMonth}
        start={start}
        end={end}
        onSelect={selectDate}
        minDate={today}
      />
      <div className="flex gap-2">
        {QUICK_RANGES.map((days) => (
          <button
            key={days}
            type="button"
            onClick={() => selectQuickRange(days)}
            className={chipClass(start === today && end === addDays(today, days - 1))}
          >
            오늘부터 {days}일
          </button>
        ))}
      </div>
    </section>
  );

  const regionSection = (
    <section id="region" className="flex scroll-mt-[100px] flex-col gap-5 px-4">
      {sectionHeading('지역 설정', '원하는 촬영 지역을 선택해 주세요.')}
      <div className="flex flex-wrap gap-2">
        {ARTIST_REGION_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            // 같은 칩을 다시 누르면 해제 — 단일 선택이라 해제 수단이 이것뿐입니다.
            onClick={() => setRegion(region === option.value ? undefined : option.value)}
            aria-pressed={region === option.value}
            className={chipClass(region === option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </section>
  );

  const headCountSection = (
    <section id="headCount" className="flex scroll-mt-[100px] flex-col gap-5 px-4">
      {sectionHeading('인원 설정', '촬영 희망 인원을 설정해 주세요.')}
      <div className="flex flex-wrap gap-2">
        {HEAD_COUNTS.map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setHeadCount(headCount === n ? undefined : n)}
            aria-pressed={headCount === n}
            className={chipClass(headCount === n)}
          >
            {n === ARTWORK_HEAD_COUNT_MAX ? `${n}인 이상` : `${n}인`}
          </button>
        ))}
      </div>
    </section>
  );

  const bottomBar = (
    <div className="fixed inset-x-0 bottom-0 z-20 mx-auto flex max-w-md gap-2 bg-neutral-100 p-2">
      <button
        type="button"
        onClick={reset}
        aria-label="필터 초기화"
        className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-md border-[1.5px] border-neutral-400"
      >
        <RotateCw size={24} strokeWidth={1.8} className="text-neutral-800" aria-hidden />
      </button>
      <button
        type="button"
        onClick={apply}
        className="h-[52px] flex-1 rounded-md bg-primary text-body-1 text-neutral-0"
      >
        적용하기
      </button>
    </div>
  );

  return (
    <div className="mx-auto max-w-md">
      {tabBar}
      {/*
        하단 여백은 고정 CTA(68px)에 마지막 칩이 가리지 않을 만큼만 둔다.
        마지막 섹션을 화면 높이만큼 늘리면 "인원" 탭이 탭바 바로 아래까지 올라오지만,
        그 대가로 스크롤 끝에 빈 화면 한 판이 남는다 — 빈 화면 쪽이 더 어색하다.
      */}
      <div className="flex flex-col gap-[60px] pb-24 pt-5">
        {dateSection}
        {regionSection}
        {headCountSection}
      </div>
      <ScrollFade offset={68} />
      {bottomBar}
    </div>
  );
}
