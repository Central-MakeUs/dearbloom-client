import type { MouseEvent } from 'react';
import { shouldUseArtworkHistoryBack } from '@/lib/artworkReturnPath';

interface Props {
  /** 히스토리를 쓸 수 없을 때(직접 진입·새로고침) 이동할 경로. */
  fallbackHref: string;
}

/**
 * 작품 상세 뒤로가기 — 같은 사이트에서 들어왔으면 history.back().
 *
 * 그냥 `/snaps` 로 링크를 걸면 새 이동이라 목록의 필터·정렬·뷰(쿼리스트링)와
 * 스크롤 위치가 전부 초기화된다. 히스토리를 되감으면 브라우저가 이전 URL과
 * 스크롤을 그대로 복원한다.
 *
 * 공유 링크로 바로 들어온 경우엔 되감을 곳이 없으므로 fallbackHref 로 보낸다.
 */
export function SnapBackButton({ fallbackHref }: Props) {
  function goBack(e: MouseEvent<HTMLAnchorElement>) {
    if (shouldUseArtworkHistoryBack(document.referrer, location.pathname, location.origin, window.history.length)) {
      e.preventDefault();
      window.history.back();
    }
    // 아니면 기본 동작(fallbackHref 로 이동)에 맡긴다.
  }

  return (
    <a
      href={fallbackHref}
      onClick={goBack}
      aria-label="뒤로가기"
      className="flex h-11 w-11 items-center justify-center text-neutral-800"
    >
      <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="m15 18-6-6 6-6" />
      </svg>
    </a>
  );
}
