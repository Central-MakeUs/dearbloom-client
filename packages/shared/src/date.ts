/** 날짜/시각 표시 포맷 — 서버는 'YYYY-MM-DD' / 'HH:MM(:SS)' 로 내려줍니다. */

const DAY_OF_WEEK_KR = ['일', '월', '화', '수', '목', '금', '토'] as const;

/** 'YYYY-MM-DD' 를 타임존 흔들림 없이 로컬 Date 로(요일 계산용). */
function toLocalDate(date: string): Date {
  const [y, m, d] = date.split('-').map(Number);
  return new Date(y ?? 1970, (m ?? 1) - 1, d ?? 1);
}

/** '26.06.11 (화)' — 문의 내역/요약 카드 */
export function shortDateLabel(date: string): string {
  const d = toLocalDate(date);
  const yy = String(d.getFullYear()).slice(2);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yy}.${mm}.${dd} (${DAY_OF_WEEK_KR[d.getDay()]})`;
}

/** '26.06.11' — 요일 없는 짧은 표기(문의 접수일 등). ISO 일시도 허용. */
export function compactDateLabel(dateOrIso: string): string {
  const d = toLocalDate(dateOrIso.slice(0, 10));
  const yy = String(d.getFullYear()).slice(2);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yy}.${mm}.${dd}`;
}

/** '26.06.11(화)' — 채팅 문의 카드. 괄호 앞 공백이 없어 `shortDateLabel` 과 다르다. */
export function chatCardDateLabel(date: string): string {
  const d = toLocalDate(date);
  const yy = String(d.getFullYear()).slice(2);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yy}.${mm}.${dd}(${DAY_OF_WEEK_KR[d.getDay()]})`;
}

/** '오전 10:00' — 'HH:MM' / 'HH:MM:SS' 모두 허용 */
export function ampmTimeLabel(time: string): string {
  const [h = 0, m = 0] = time.split(':').map(Number);
  const meridiem = h < 12 ? '오전' : '오후';
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${meridiem} ${hour12}:${String(m).padStart(2, '0')}`;
}

/** ISO 일시('2026-06-11T09:00:00')에서 '오전 09:00' 형태의 시각만. */
export function ampmDateTimeLabel(isoDateTime: string): string {
  return ampmTimeLabel(isoDateTime.slice(11, 16));
}

/** 채팅 목록의 마지막 메시지 시각 — 오늘이면 '오전 09:00', 아니면 '26.06.11 (화)'. */
export function chatTimestampLabel(isoDateTime: string, now = new Date()): string {
  const date = isoDateTime.slice(0, 10);
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  return date === today ? ampmDateTimeLabel(isoDateTime) : shortDateLabel(date);
}
