const toMinutes = (time: string) => {
  const [hour = 0, minute = 0] = time.split(':').map(Number);
  return hour * 60 + minute;
};

const toTime = (minutes: number) =>
  `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;

export function getSlotTimes(
  startTime: string,
  requiredSlotCount: number,
  stepMinutes: number,
): string[] {
  if (!startTime) return [];
  const start = toMinutes(startTime);
  const count = Math.max(requiredSlotCount, 1);
  const step = stepMinutes > 0 ? stepMinutes : 30;
  return Array.from({ length: count }, (_, index) => toTime(start + index * step));
}

export function getStartTimes(
  times: string[],
  requiredSlotCount: number,
  stepMinutes: number,
): string[] {
  const available = new Set(times.map(toMinutes));
  return times
    .filter((time) => {
      return getSlotTimes(time, requiredSlotCount, stepMinutes).every((slot) =>
        available.has(toMinutes(slot)),
      );
    })
    .map((time) => time.slice(0, 5));
}
