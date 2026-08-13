import { ampmTimeLabel, chatCardDateLabel, type InquiryCard } from '@dearbloom/shared';

interface InquiryCardBubbleProps {
  card: InquiryCard;
  /** 작품 상세 경로. 기본 `/snaps/{artworkId}`. */
  artworkHref?: (artworkId: number) => string;
}

/** 조건 줄 사이의 세로 구분선 — Figma Vector 8911(1×12, neutral/n400). */
const Divider = () => <span className="h-3 w-px shrink-0 bg-neutral-400" aria-hidden />;

/**
 * 문의 카드 말풍선(messageType=INQUIRY) — 문의 전송 시 백엔드가 자동으로 남긴 스냅샷.
 * 값이 스냅샷이라 이후 작품이 수정돼도 문의 당시 조건이 그대로 보인다.
 *
 * Figma 234:6470 실측 — 245 폭, radius 16, 흰 배경 + neutral-200 테두리,
 * 안쪽 여백 20(아래만 16), 블록 사이 12, 버튼 위 24.
 */
export function InquiryCardBubble({ card, artworkHref }: InquiryCardBubbleProps) {
  // 작품이 삭제되면 artworkId 가 null 로 온다 — 카드 내용은 스냅샷이라 그대로 두고 이동만 막는다.
  const href =
    card.artworkId == null ? null : artworkHref ? artworkHref(card.artworkId) : `/snaps/${card.artworkId}`;

  // radius 6 은 디자인 토큰(4/8/12/16)에 없는 값이라 그대로 지정한다.
  const detailLink = href ? (
    <a
      href={href}
      className="mt-6 flex h-[38px] items-center justify-center rounded-[6px] bg-primary-50 text-caption-1 text-primary"
    >
      작품상세 보기
    </a>
  ) : (
    <p className="mt-6 flex h-[38px] items-center justify-center rounded-[6px] bg-neutral-200 text-caption-1 text-neutral-500">
      삭제된 작품이에요
    </p>
  );

  const heading = (
    <div>
      <p className="text-body-3 text-neutral-900">{card.artworkName}</p>
      <p className="text-body-5 text-neutral-600">{card.artistNickname}</p>
    </div>
  );

  const conditions = (
    <div className="mt-3">
      <p className="text-body-5 text-neutral-900">{card.packageName}</p>
      <div className="flex items-center gap-2">
        <span className="text-body-5 text-neutral-900">{chatCardDateLabel(card.shootDate)}</span>
        <Divider />
        <span className="text-body-5 text-neutral-900">{ampmTimeLabel(card.startTime)}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="shrink-0 text-body-5 text-neutral-900">{card.headCount}명</span>
        <Divider />
        <span className="truncate text-body-5 text-neutral-900">{card.schoolName}</span>
      </div>
    </div>
  );

  return (
    <div className="w-[245px] rounded-xl border border-neutral-200 bg-neutral-0 px-5 pb-4 pt-5">
      {heading}
      {conditions}
      {card.requestNote && (
        <p className="mt-3 whitespace-pre-line text-body-5 text-neutral-900">{card.requestNote}</p>
      )}
      {detailLink}
    </div>
  );
}
