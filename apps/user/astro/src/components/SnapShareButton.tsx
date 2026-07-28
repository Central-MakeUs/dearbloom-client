import { Share } from 'lucide-react';

/**
 * 작품 상세 헤더의 공유 버튼(island). 기존 인라인 <script> 의 navigator.share 로직을 대체.
 * Web Share 미지원 시 클립보드로 URL 복사.
 */
export function SnapShareButton() {
  async function share() {
    const data = { title: document.title, url: location.href };
    try {
      if (navigator.share) await navigator.share(data);
      else if (navigator.clipboard) await navigator.clipboard.writeText(location.href);
    } catch {
      /* 사용자 취소 무시 */
    }
  }

  return (
    <button
      type="button"
      onClick={share}
      aria-label="공유"
      className="flex h-11 w-11 items-center justify-center text-neutral-950"
    >
      <Share size={22} strokeWidth={1.8} aria-hidden />
    </button>
  );
}
