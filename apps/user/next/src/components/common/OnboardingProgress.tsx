import { cn } from '@dearbloom/ui';

export function OnboardingProgress({ step, total = 3 }: { step: 1 | 2 | 3; total?: 2 | 3 }) {
  const bars = [1, 2, 3].slice(0, total).map((index) => (
    <span
      aria-hidden
      className={cn(
        'h-1 flex-1 rounded-full',
        index <= step ? 'bg-primary-400' : 'bg-neutral-200',
      )}
      key={index}
    />
  ));

  return (
    <div aria-label={`${step}/${total} 단계`} className="flex gap-1 px-4">
      {bars}
    </div>
  );
}
