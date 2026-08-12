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
 * 시각은 말풍선에서 12 떨어져 아래 끝에 정렬. 시각 위의 안읽음 '1' 은 **내가 보낸 메시지**에만
 * 붙는다 — 상대 메시지의 `read` 는 내가 방에 들어온 시점에 참으로 수렴해 의미가 없다.
 */
export function MessageRow({ message, myRole, artworkHref }: MessageRowProps) {
  const mine = message.senderRole === myRole;

  const bubble =
    message.messageType === 'INQUIRY' && message.inquiryCard ? (
      <InquiryCardBubble card={message.inquiryCard} artworkHref={artworkHref} />
    ) : message.messageType === 'IMAGE' && message.imageUrl ? (
      // 폭은 max-w 가 아니라 고정 — 작은 이미지까지 247 로 늘어나지만, max-w 로 두면
      // 작은 이미지가 몇 px 짜리 점이 돼 메시지가 안 보이는 것처럼 읽힌다.
      // loading="lazy" 도 쓰면 안 된다 — 로드 전 0x0 이라 스크롤 컨테이너 안에서
      // 뷰포트 판정이 걸리지 않아 이미지가 영영 안 뜬다.
      <img
        src={message.imageUrl}
        alt="보낸 사진"
        className="w-[247px] rounded-xl border border-neutral-200"
      />
    ) : (
      <p className="max-w-[247px] whitespace-pre-line rounded-xl border border-neutral-200 bg-neutral-0 px-[22px] py-4 text-body-5 text-neutral-950">
        {message.content}
      </p>
    );

  // 11px/700·11px/500 은 Figma 에 이름 붙은 타이포 스타일이 없어(Caption3 는 11px/400) 값으로 지정한다.
  const meta = (
    <div
      className={cn(
        'flex shrink-0 flex-col whitespace-nowrap leading-[1.5]',
        mine ? 'items-end' : 'items-start',
      )}
    >
      {mine && !message.read && (
        <span className="text-[11px] font-bold text-neutral-700" aria-label="읽지 않음">
          1
        </span>
      )}
      <span className="text-[11px] font-medium text-neutral-600">
        {ampmDateTimeLabel(message.createdAt)}
      </span>
    </div>
  );

  return (
    <div className={cn('flex items-end gap-3', mine ? 'justify-end' : 'justify-start')}>
      {mine && meta}
      {bubble}
      {!mine && meta}
    </div>
  );
}
