/** 촬영 시작 시간 그리드 — 09:00~20:30 을 30분 간격으로 끊은 24개 고정 격자. */

const GRID_START_MINUTES = 9 * 60;
const GRID_END_MINUTES = 21 * 60;

const toLabel = (minutes: number) =>
  `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;

/** ['09:00', '09:30', ..., '20:30'] */
export function buildSlotGrid(stepMinutes: number): string[] {
  const step = stepMinutes > 0 ? stepMinutes : 30;
  const slots: string[] = [];
  for (let m = GRID_START_MINUTES; m < GRID_END_MINUTES; m += step) slots.push(toLabel(m));
  return slots;
}

/** 서버가 주는 'HH:MM:SS' 가용 시각을 그리드와 같은 'HH:MM' 키 집합으로. */
export function toAvailableSet(availableTimes: string[]): Set<string> {
  return new Set(availableTimes.map((t) => t.slice(0, 5)));
}

/**
 * 그 슬롯에서 촬영을 시작할 수 있는지.
 * 가용 셀 하나로는 부족하고, 촬영 소요시간만큼(requiredSlotCount) 연속으로 비어 있어야 한다.
 */
export function isSelectableStart(
  slot: string,
  available: Set<string>,
  requiredSlotCount: number,
  stepMinutes: number,
): boolean {
  const [h = 0, m = 0] = slot.split(':').map(Number);
  const start = h * 60 + m;
  const needed = requiredSlotCount > 0 ? requiredSlotCount : 1;

  for (let i = 0; i < needed; i++) {
    if (!available.has(toLabel(start + i * stepMinutes))) return false;
  }
  return true;
}
