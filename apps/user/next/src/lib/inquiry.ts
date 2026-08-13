/** '오전 10:00' */
export function ampmTimeLabel(time: string): string {
  const [hour = 0, minute = 0] = time.split(':').map(Number);
  return `${hour < 12 ? '오전' : '오후'} ${String(hour % 12 || 12).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

/** '1시간 30분' */
export function durationLabel(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (hours && remainingMinutes) return `${hours}시간 ${remainingMinutes}분`;
  return hours ? `${hours}시간` : `${remainingMinutes}분`;
}
