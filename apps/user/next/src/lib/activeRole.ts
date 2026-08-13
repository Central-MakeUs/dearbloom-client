import type { ChatRole } from '@dearbloom/shared';

/**
 * accessToken(JWT)의 `activeRole` 클레임을 읽습니다.
 *
 * 서명 검증은 하지 않습니다 — 이 값은 "고객용/작가용 중 어느 엔드포인트로 프록시할지" 고르는 데만 쓰고,
 * 실제 권한 판정은 백엔드가 같은 토큰으로 다시 합니다. 클레임이 없거나 파싱에 실패하면 undefined.
 */
export function getActiveRole(token: string): ChatRole | undefined {
  try {
    const payload = token.split('.')[1];
    if (!payload) return undefined;

    const { activeRole } = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as {
      activeRole?: unknown;
    };

    return activeRole === 'CUSTOMER' || activeRole === 'ARTIST' ? activeRole : undefined;
  } catch {
    return undefined;
  }
}
