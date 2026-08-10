import type { InquiryStatus } from '@dearbloom/shared';

/**
 * 하단 고정 액션바의 표시 조건과 여백.
 *
 * 서버 컴포넌트(page.tsx)와 클라이언트 컴포넌트(InquiryActions.tsx)가 함께 쓰므로
 * `'use client'` 가 없는 별도 모듈에 둔다.
 * (client 모듈의 export 는 서버에서 client reference 로 바뀌어 값으로 쓸 수 없다.)
 */

/** 액션바가 뜨는 상태. */
export function hasInquiryActions(status: InquiryStatus): boolean {
  return status === 'RESERVED' || status === 'IN_PROGRESS';
}

/**
 * 액션바(패딩 16*2 + 버튼 52 + 보더 1 ≈ 85px)만큼 본문을 밀어주는 클래스.
 * 하단탭 높이는 `ArtistLayout` 의 `pb-20` 이 이미 확보하므로 여기선 바 높이만 더한다.
 */
export const ACTION_BAR_OFFSET = 'pb-[calc(88px+env(safe-area-inset-bottom))]';

/** 하단탭(60px + safe-area) 바로 위에 붙는다. */
export const ACTION_BAR_BOTTOM = 'bottom-[calc(60px+env(safe-area-inset-bottom))]';
