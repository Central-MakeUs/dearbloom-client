import type { ArtistRegionCode, CreateCustomerPayload } from '@dearbloom/shared';

const namePattern = /^[A-Za-z가-힣]{2,5}$/;
const regionCodes = new Set<ArtistRegionCode>([
  'SEOUL',
  'GYEONGGI_NORTH',
  'GYEONGGI_SOUTH',
  'INCHEON',
  'BUSAN',
  'DAEGU',
  'GWANGJU',
  'DAEJEON_SEJONG',
  'ULSAN',
  'GANGWON',
  'CHUNGBUK',
  'CHUNGNAM',
  'JEONBUK',
  'JEONNAM',
  'GYEONGBUK',
  'GYEONGNAM',
  'JEJU',
]);

export function parseCustomerPayload(body: unknown): CreateCustomerPayload | undefined {
  if (!body || typeof body !== 'object') return undefined;

  const { name, region, universityId } = body as Record<string, unknown>;
  const trimmedName = typeof name === 'string' ? name.trim() : '';
  if (!namePattern.test(trimmedName)) return undefined;
  if (universityId !== undefined && (!Number.isInteger(universityId) || Number(universityId) <= 0)) {
    return undefined;
  }
  if (
    region !== undefined &&
    (typeof region !== 'string' || !regionCodes.has(region as ArtistRegionCode))
  ) {
    return undefined;
  }

  return {
    name: trimmedName,
    ...(region === undefined ? {} : { region: region as ArtistRegionCode }),
    ...(universityId === undefined ? {} : { universityId: Number(universityId) }),
  };
}
