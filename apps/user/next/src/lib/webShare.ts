export function isShareCancelled(error: unknown) {
  return (
    typeof error === 'object' &&
    error !== null &&
    'name' in error &&
    error.name === 'AbortError'
  );
}

export function isMobileShareDevice(
  userAgent: string,
  maxTouchPoints: number,
  nativePlatform?: string,
) {
  return (
    nativePlatform === 'ios' ||
    nativePlatform === 'android' ||
    /Android|iPhone|iPad|iPod/i.test(userAgent) ||
    (/Macintosh/i.test(userAgent) && maxTouchPoints > 1)
  );
}
