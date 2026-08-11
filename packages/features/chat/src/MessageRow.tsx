import { ampmDateTimeLabel, type ChatMessage, type ChatRole } from '@dearbloom/shared';
import { cn } from '@dearbloom/ui';
import { InquiryCardBubble } from './InquiryCardBubble';

interface MessageRowProps {
  message: ChatMessage;
  myRole: ChatRole;
  artworkHref?: (artworkId: number) => string;
}

/**
 * 메시지 한 줄 — 내 메시지는 오른쪽, 상대 메시지는 왼쪽. 시각은 말풍선 바깥 아래쪽에 붙는다.
 *
 * Figma 234:6470 실측 — 말풍선은 보낸 쪽과 무관하게 흰 배경 + neutral-200 테두리 + radius 16,
 * 시각은 말풍선에서 12 떨어져 아래 끝에 정렬. 시각 위의 안읽음 '1' 은 백엔드가
 * 메시지별 읽음 여부를 내려주지 않아 아직 렌더하지 않는다(자리는 이 레이아웃 그대로).
 */
export function MessageRow({ message, myRole, artworkHref }: MessageRowProps) {
  const mine = message.senderRole === myRole;

  const bubble =
    message.messageType === 'INQUIRY' && message.inquiryCard ? (
      <InquiryCardBubble card={message.inquiryCard} artworkHref={artworkHref} />
    ) : message.messageType === 'IMAGE' && message.imageUrl ? (
      // loading="lazy" 를 쓰면 안 된다 — 로드 전 0x0 이라 스크롤 컨테이너 안에서
      // 뷰포트 판정이 걸리지 않아 이미지가 영영 안 뜬다(1px 점으로 남는다).
      <img
        src={message.imageUrl}
        alt="보낸 사진"
        className="w-[247px] rounded-xl border border-neutral-200 object-cover"
      />
    ) : (
      <p className="max-w-[247px] whitespace-pre-line rounded-xl border border-neutral-200 bg-neutral-0 px-[22px] py-4 text-body-5 text-neutral-950">
        {message.content}
      </p>
    );

  // 11px/500 은 Figma 에 이름 붙은 타이포 스타일이 없어(Caption3 는 11px/400) 값으로 지정한다.
  const timestamp = (
    <span className="shrink-0 whitespace-nowrap text-[11px] font-medium leading-[1.5] text-neutral-600">
      {ampmDateTimeLabel(message.createdAt)}
    </span>
  );

  return (
    <div className={cn('flex items-end gap-3', mine ? 'justify-end' : 'justify-start')}>
      {mine && timestamp}
      {bubble}
      {!mine && timestamp}
    </div>
  );
}
