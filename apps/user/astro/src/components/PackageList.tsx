import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
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

/**
 * 패키지 리스트 (island) — Figma: 처음 2개만 노출, 나머지는 '패키지 N개 더보기' 토글로 노출.
 */
export function PackageList({ packages }: { packages: Package[] }) {
  const [open, setOpen] = useState(false);
  const hasToggle = packages.length > INITIAL_VISIBLE;
  const shown = open || !hasToggle ? packages : packages.slice(0, INITIAL_VISIBLE);
  const hiddenCount = packages.length - INITIAL_VISIBLE;

  return (
    <div>
      <div className="mx-4 flex flex-col gap-3">
        {shown.map((pkg) => (
          <div key={pkg.artworkPackageId} className="rounded-lg bg-neutral-0 p-4">
            <div className="flex items-center justify-between gap-3">
              <span className="text-body-5 text-neutral-950">{pkg.packageName}</span>
              <span className="shrink-0 text-body-3 font-semibold text-neutral-900">{won(pkg.price)}</span>
            </div>
            <dl className="mt-3 flex flex-col gap-2 border-t border-neutral-200 pt-3">
              {pkg.durationMinutes != null && (
                <div className="flex items-start justify-between gap-4">
                  <dt className="text-body-6 text-neutral-600">촬영 시간</dt>
                  <dd className="text-body-5 text-neutral-950">{pkg.durationMinutes}분</dd>
                </div>
              )}
              {pkg.finalPhotoCount != null && (
                <div className="flex items-start justify-between gap-4">
                  <dt className="text-body-6 text-neutral-600">보정본 수</dt>
                  <dd className="text-body-5 text-neutral-950">{pkg.finalPhotoCount}장</dd>
                </div>
              )}
              {pkg.extraInfo && (
                <div className="flex items-start justify-between gap-4">
                  <dt className="shrink-0 text-body-6 text-neutral-600">추가</dt>
                  <dd className="text-right text-body-5 text-neutral-950">{pkg.extraInfo}</dd>
                </div>
              )}
            </dl>
          </div>
        ))}
      </div>
      {hasToggle && (
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="mx-4 mt-3 flex w-[calc(100%-2rem)] items-center justify-center gap-1 rounded-lg border border-neutral-200 bg-neutral-0 py-3 text-body-5 text-neutral-700"
        >
          {open ? '패키지 접기' : `패키지 ${hiddenCount}개 더보기`}
          <ChevronDown
            size={20}
            strokeWidth={2}
            aria-hidden
            className={cn('transition-transform', open && 'rotate-180')}
          />
        </button>
      )}
    </div>
  );
}
