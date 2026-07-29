'use client';

import { ARTIST_REGION_OPTIONS, type ArtistRegionCode } from '@dearbloom/shared';
import { ToggleGroup, ToggleGroupItem } from '@dearbloom/ui';

type ArtistRegionFieldProps = {
  error?: string | null;
  onValueChange: (regions: ArtistRegionCode[]) => void;
  value: ArtistRegionCode[];
};

export function ArtistRegionField({ error, onValueChange, value }: ArtistRegionFieldProps) {
  return (
    <div>
      <span className="mb-1 block text-body-4 text-neutral-800">활동 지역</span>
      <ToggleGroup
        aria-label="활동 지역"
        onValueChange={(regions) => onValueChange(regions as ArtistRegionCode[])}
        type="multiple"
        value={value}
      >
        {ARTIST_REGION_OPTIONS.map((region) => (
          <ToggleGroupItem key={region.value} value={region.value}>
            {region.label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
      {error ? (
        <p className="mt-1 text-caption-1 text-danger" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
