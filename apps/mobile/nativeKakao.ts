export const NATIVE_KAKAO_AVAILABILITY = 'NATIVE_KAKAO_AVAILABILITY';
export const NATIVE_KAKAO_AVAILABILITY_RESULT = 'NATIVE_KAKAO_AVAILABILITY_RESULT';

export function isNativeKakaoAvailabilityRequest(message: string) {
  try {
    return (JSON.parse(message) as { type?: unknown }).type === NATIVE_KAKAO_AVAILABILITY;
  } catch {
    return false;
  }
}

export function createNativeKakaoAvailabilityResultScript(available: boolean) {
  return `window.dispatchEvent(new CustomEvent('${NATIVE_KAKAO_AVAILABILITY_RESULT}', { detail: { available: ${available} } })); true;`;
}
