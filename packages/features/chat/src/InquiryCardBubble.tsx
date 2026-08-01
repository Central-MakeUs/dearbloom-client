import { ampmTimeLabel, fullDateLabel, type InquiryCard } from '@dearbloom/shared';

interface InquiryCardBubbleProps {
  card: InquiryCard;
  /** 작품 상세 경로. 기본 `/snaps/{artworkId}`. */
  artworkHref?: (artworkId: number) => string;
}

/**
 * 문의 카드 말풍선(messageType=INQUIRY) — 문의 전송 시 백엔드가 자동으로 남긴 스냅샷.
 * 값이 스냅샷이라 이후 작품이 수정돼도 문의 당시 조건이 그대로 보인다.
 */
export function InquiryCardBubble({ card, artworkHref }: InquiryCardBubbleProps) {
  const href = artworkHref ? artworkHref(card.artworkId) : `/snaps/${card.artworkId}`;

  return (
    <div className="w-[280px] rounded-xl bg-neutral-0 p-4">
      <p className="text-body-3 font-semibold text-neutral-950">{card.artworkName}</p>
      <p className="mt-0.5 text-body-4 text-neutral-500">{card.artistNickname}</p>

      <p className="mt-3 text-body-4 text-neutral-950">
        {fullDateLabel(card.shootDate)} <span className="text-neutral-300">|</span>{' '}
        {ampmTimeLabel(card.startTime)}
      </p>
      <p className="mt-1 text-body-4 text-neutral-950">
        {card.schoolName} <span className="text-neutral-300">|</span> {card.headCount}명
      </p>

      {card.requestNote && (
        <p className="mt-4 whitespace-pre-line text-body-4 text-neutral-950">{card.requestNote}</p>
      )}

      <a
        href={href}
        className="mt-4 block rounded-md bg-neutral-200 py-3 text-center text-body-4 text-primary"
      >
        작품상세 보기
      </a>
    </div>
  );
}
