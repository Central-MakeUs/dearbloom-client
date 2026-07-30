type RegionOption<T extends string> = {
  label: string;
  value: T;
};

export function parseArtistRegions<T extends string>(
  values: unknown[],
  options: readonly RegionOption<T>[],
): T[] | undefined {
  const regions: T[] = [];

  for (const value of values) {
    if (typeof value !== 'string') return undefined;

    const normalized = value.trim();
    const region = options.find(
      (option) =>
        option.value === normalized.toUpperCase() || option.label === normalized,
    )?.value;
    if (!region) return undefined;

    regions.push(region);
  }

  return regions.length > 0 ? [...new Set(regions)] : undefined;
}
