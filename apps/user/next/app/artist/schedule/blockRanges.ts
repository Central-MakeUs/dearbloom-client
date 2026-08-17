/**
 * 예약 불가 시간 겹침 처리 — 반복(요일) / 개인(날짜) 둘 다 같은 규칙을 쓴다.
 *
 * 서버는 겹치는 규칙을 그대로 쌓아두기 때문에(12:00~13:00 과 12:30~14:00 이 별개 행으로 남는다),
 * 추가하기 전에 프론트에서 합쳐 보낸다. 시간은 'HH:MM' 이라 문자열 비교가 곧 시간 비교다.
 */

export interface TimeRange {
  start: string;
  end: string;
}

export interface ExistingBlock extends TimeRange {
  id: number;
}

export type BlockPlan =
  /** 이미 같은 시간이 있거나 기존 범위 안에 들어간다 — 아무것도 하지 않는다. */
  | { action: 'skip' }
  /** removeIds 를 지우고 start~end 로 다시 추가한다. 겹침이 없으면 removeIds 는 빈 배열. */
  | { action: 'add'; start: string; end: string; removeIds: number[] };

/** 같은 요일(또는 같은 날짜)의 기존 블록들과 비교해 무엇을 지우고 무엇을 넣을지 정한다. */
export function planBlockAdd(existing: ExistingBlock[], next: TimeRange): BlockPlan {
  // 경계만 맞닿은 건(13:00 끝 ↔ 13:00 시작) 겹친 게 아니라 이어지는 것이라 따로 둔다.
  const overlapping = existing.filter((e) => e.start < next.end && next.start < e.end);

  if (overlapping.some((e) => e.start <= next.start && next.end <= e.end)) return { action: 'skip' };

  if (overlapping.length === 0) return { action: 'add', start: next.start, end: next.end, removeIds: [] };

  const start = [next.start, ...overlapping.map((o) => o.start)].sort()[0]!;
  const end = [next.end, ...overlapping.map((o) => o.end)].sort().at(-1)!;
  return { action: 'add', start, end, removeIds: overlapping.map((o) => o.id) };
}
