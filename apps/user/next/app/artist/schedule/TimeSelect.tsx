'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@dearbloom/ui';

/**
 * 30분 단위 시간 슬롯 드롭다운. 네이티브 time input 대신 정해진 슬롯만 선택 가능.
 * options 로 선택 가능한 슬롯을 제한(시작<종료, 09:00~21:00 등)합니다.
 */
export function TimeSelect({
  value,
  onChange,
  options,
  disabled,
  ariaLabel,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  disabled?: boolean;
  ariaLabel?: string;
}) {
  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger aria-label={ariaLabel} className="h-auto w-[84px] py-2">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o} value={o}>
            {o}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

// ---- 슬롯 유틸 (09:00~21:00, 30분 단위) ----

const START_HOUR = 9;
const END_HOUR = 21;
const STEP_MIN = 30;

function genSlots(): string[] {
  const slots: string[] = [];
  for (let m = START_HOUR * 60; m <= END_HOUR * 60; m += STEP_MIN) {
    const h = Math.floor(m / 60);
    const mm = m % 60;
    slots.push(`${String(h).padStart(2, '0')}:${String(mm).padStart(2, '0')}`);
  }
  return slots;
}

/** 전체 슬롯 09:00 ~ 21:00 */
export const ALL_SLOTS = genSlots();
/** 시작으로 고를 수 있는 슬롯(마지막 21:00 제외 → 뒤에 종료가 있어야 함) */
export const START_SLOTS = ALL_SLOTS.slice(0, -1);
/** 시작 이후의 종료 슬롯만 */
export function endSlotsAfter(start: string): string[] {
  return ALL_SLOTS.filter((s) => s > start);
}
/** 시작 바로 다음 슬롯(종료 자동 보정용) */
export function nextSlot(start: string): string {
  const i = ALL_SLOTS.indexOf(start);
  return ALL_SLOTS[Math.min(i + 1, ALL_SLOTS.length - 1)] ?? start;
}
