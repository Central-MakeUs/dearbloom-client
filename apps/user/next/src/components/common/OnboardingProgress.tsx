import { cn } from '@dearbloom/ui';

export function OnboardingProgress({
  step,
  total = 3,
}: {
  step: 1 | 2 | 3 | 4;
  total?: 2 | 3 | 4;
}) {
  const bars = [1, 2, 3, 4]
    .slice(0, total)
    .map((index) => (
      <span
        aria-hidden
        style={{ height: 6, minHeight: 6, maxHeight: 6 }}
        className={cn(
          'flex-1 rounded-full',
          index <= step ? 'bg-primary-400' : 'bg-neutral-200',
        )}
        key={index}
      />
    ));

  return (
    <div aria-label={`${step}/${total} 단계`} className="flex gap-[5px] px-4 py-1">
      {bars}
    </div>
  );
}
