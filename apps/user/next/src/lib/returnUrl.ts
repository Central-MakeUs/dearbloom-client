/**
 * 로그인 후 복귀할 returnUrl 검증.
 * 오픈 리다이렉트를 막기 위해 **같은 오리진 내부 경로만** 허용한다.
 * - 반드시 단일 '/' 로 시작 (프로토콜-상대 '//host' 차단)
 * - 개행/역슬래시 등 우회 문자 차단
 * 유효하지 않으면 undefined.
 */
export function safeReturnUrl(value: string | null | undefined): string | undefined {
  if (!value) return undefined;
  if (!value.startsWith('/') || value.startsWith('//') || value.startsWith('/\\')) return undefined;
  if (/[\n\r\t\\]/.test(value)) return undefined;
  return value;
}
