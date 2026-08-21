import { useState } from 'react';
import { cn } from '@dearbloom/ui';

interface Package {
  artworkPackageId: number;
  packageName: string;
  price: number;
  durationMinutes: number | null;
  finalPhotoCount: number | null;
  extraInfo: string | null;
}

const INITIAL_VISIBLE = 2;
const won = (n: number) => `${n.toLocaleString()}원`;
const minutes = (m: number | null) => {
  if (m == null) return '';
  const h = Math.floor(m / 60);
  const rest = m % 60;
  if (h && rest) return `${h}시간 ${rest}분`;
  if (h) return `${h}시간`;
  return `${rest}분`;
};

/**
 * 패키지 카드 리스트 (island) — Figma: 각 카드는 4행 표(항목/촬영 시간/가격/보정본 수).
 * 처음 2개만 노출, 나머지는 '패키지 N개 더보기' 토글로 노출.
 */
export function PackageList({ packages }: { packages: Package[] }) {
  const [open, setOpen] = useState(false);
  const hasToggle = packages.length > INITIAL_VISIBLE;
  const shown = open || !hasToggle ? packages : packages.slice(0, INITIAL_VISIBLE);
  const hiddenCount = packages.length - INITIAL_VISIBLE;

  const row = (label: string, value: string) => (
    <div className="flex items-start justify-between gap-4">
      <span className="text-body-5 text-neutral-800">{label}</span>
      <span className="text-right text-body-4 text-neutral-900">{value}</span>
    </div>
  );

  return (
    <div>
      <div className="mx-4 flex flex-col gap-2">
        {shown.map((pkg) => (
          <div key={pkg.artworkPackageId} className="rounded-md bg-neutral-0 p-5">
            <p className="text-body-4 text-neutral-900">{pkg.packageName}</p>
            <div className="my-4 h-px bg-neutral-200" />
            <dl className="flex flex-col gap-4">
              {row('가격', won(pkg.price))}
              {pkg.durationMinutes != null && row('촬영 시간', minutes(pkg.durationMinutes))}
              {pkg.finalPhotoCount != null && row('보정본 수', `${pkg.finalPhotoCount}장`)}
              {pkg.extraInfo && row('추가', pkg.extraInfo)}
            </dl>
          </div>
        ))}
      </div>
      {hasToggle && (
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="mx-4 mt-2 flex h-12 w-[calc(100%-2rem)] items-center justify-center gap-1 rounded-[6px] bg-neutral-200 px-4 py-[14px] text-body-4 text-neutral-800"
        >
          {open ? '패키지 접기' : `패키지 ${hiddenCount}개 더보기`}
          <span
            className={cn(
              'flex size-5 items-center justify-center transition-transform',
              open && 'rotate-180',
            )}
            aria-hidden
          >
            <img
              src="/images/package-list-chevron.svg"
              alt=""
              className="h-[6.5px] w-[11.5px]"
            />
          </span>
        </button>
      )}
    </div>
  );
}
