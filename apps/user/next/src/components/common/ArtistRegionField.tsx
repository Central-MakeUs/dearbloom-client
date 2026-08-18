'use client';

import { ARTIST_REGION_OPTIONS, type ArtistRegionCode } from '@dearbloom/shared';
import { cn } from '@dearbloom/ui';

type ArtistRegionFieldProps = {
  error?: string | null;
  onValueChange: (regions: ArtistRegionCode[]) => void;
  value: ArtistRegionCode[];
};

export function ArtistRegionField({
  error,
  onValueChange,
  value,
}: ArtistRegionFieldProps) {
  const regionOptions = ARTIST_REGION_OPTIONS.map((region) => {
    const selected = value.includes(region.value);

    return (
      <button
        aria-pressed={selected}
        className={cn(
          'rounded-full px-3 py-1.5 text-body-5 transition-colors',
          selected
            ? 'border-[1.2px] border-primary bg-primary-200 font-semibold text-primary'
            : 'bg-neutral-200 text-neutral-700',
        )}
        key={region.value}
        onClick={() =>
          onValueChange(
            selected ? value.filter((item) => item !== region.value) : [...value, region.value],
          )
        }
        type="button"
      >
        {region.label}
      </button>
    );
  });

  return (
    <div>
      <div className="mb-1 flex items-center gap-1.5">
        <span className="text-body-4 text-neutral-800">활동 지역</span>
        <span className="text-caption-2 text-neutral-500">한 곳 이상 선택해주세요</span>
      </div>
      <div aria-label="활동 지역" className="flex flex-wrap gap-2" role="group">
        {regionOptions}
      </div>
      {error ? (
        <p className="mt-1 text-caption-1 text-danger" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
