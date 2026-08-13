import { cn } from '../lib/cn';

export type CustomerProfileColor = 'GREEN' | 'GREY' | 'BROWN' | 'BLUE';

const colorClass: Record<CustomerProfileColor, string> = {
  GREEN: 'bg-profile-green',
  GREY: 'bg-profile-grey',
  BROWN: 'bg-profile-brown',
  BLUE: 'bg-profile-blue',
};

export function CustomerProfileAvatar({
  className,
  color,
}: {
  className?: string;
  color?: CustomerProfileColor | null;
}) {
  const profileColor = color ?? 'GREY';

  return (
    <div
      aria-hidden
      className={cn(
        'relative size-12 shrink-0 rounded-full text-neutral-0',
        colorClass[profileColor],
        className,
      )}
    >
      <div className="absolute inset-0 grid place-items-center overflow-hidden rounded-full">
        <svg className="h-[29.823px] w-[23.836px]" fill="none" viewBox="0 0 23.8355 29.8229">
          <path
            d="M11.9177 17.8229C5.79728 17.8229 0.747024 22.405 0.0102004 28.3259C-0.0921036 29.148 0.589304 29.8229 1.41773 29.8229H22.4177C23.2462 29.8229 23.9276 29.148 23.8253 28.3259C23.0884 22.405 18.0382 17.8229 11.9177 17.8229Z"
            fill="currentColor"
          />
          <path
            d="M12.5886 9.98754C12.1663 10.1987 11.6692 10.1987 11.2469 9.98754L2.49104 5.60961C2.04882 5.38849 2.04881 4.75741 2.49104 4.53629L11.2469 0.158359C11.6692 -0.0527862 12.1663 -0.0527866 12.5886 0.158359L21.3444 4.53629C21.7866 4.75741 21.7866 5.38849 21.3444 5.60961L12.5886 9.98754Z"
            fill="currentColor"
          />
          <path
            d="M20.9177 5.07295C20.9177 4.65874 20.5819 4.32295 20.1677 4.32295C19.7535 4.32295 19.4177 4.65874 19.4177 5.07295V9.57295C19.4177 9.98716 19.7535 10.3229 20.1677 10.3229C20.5819 10.3229 20.9177 9.98716 20.9177 9.57295V5.07295Z"
            fill="currentColor"
          />
          <path
            d="M17.7478 8.90645C17.8578 9.36075 17.9177 9.83484 17.9177 10.3229C17.9177 13.6367 15.2314 16.3229 11.9177 16.3229C8.60402 16.3229 5.91773 13.6367 5.91773 10.3229C5.91773 9.83496 5.97625 9.36064 6.08619 8.90645L11.2468 11.4875C11.6691 11.6986 12.1663 11.6986 12.5886 11.4875L17.7478 8.90645Z"
            fill="currentColor"
          />
        </svg>
      </div>
    </div>
  );
}
