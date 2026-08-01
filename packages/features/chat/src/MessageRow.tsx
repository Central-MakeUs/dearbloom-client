import { ampmDateTimeLabel, type ChatMessage, type ChatRole } from '@dearbloom/shared';
import { cn } from '@dearbloom/ui';
import { InquiryCardBubble } from './InquiryCardBubble';

interface MessageRowProps {
  message: ChatMessage;
  myRole: ChatRole;
  artworkHref?: (artworkId: number) => string;
}

/** 메시지 한 줄 — 내 메시지는 오른쪽, 상대 메시지는 왼쪽. 시각은 말풍선 바깥 아래쪽에 붙는다. */
export function MessageRow({ message, myRole, artworkHref }: MessageRowProps) {
  const mine = message.senderRole === myRole;

  const bubble =
    message.messageType === 'INQUIRY' && message.inquiryCard ? (
      <InquiryCardBubble card={message.inquiryCard} artworkHref={artworkHref} />
    ) : message.messageType === 'IMAGE' && message.imageUrl ? (
      <img
        src={message.imageUrl}
        alt=""
        className="max-w-[240px] rounded-xl object-cover"
        loading="lazy"
      />
    ) : (
      <p
        className={cn(
          'max-w-[240px] whitespace-pre-line rounded-xl px-4 py-3 text-body-4',
          mine ? 'bg-primary text-neutral-0' : 'bg-neutral-0 text-neutral-950',
        )}
      >
        {message.content}
      </p>
    );

  const timestamp = (
    <span className="shrink-0 pb-1 text-caption-2 text-neutral-500">
      {ampmDateTimeLabel(message.createdAt)}
    </span>
  );

  return (
    <div className={cn('flex items-end gap-2', mine ? 'justify-end' : 'justify-start')}>
      {mine && timestamp}
      {bubble}
      {!mine && timestamp}
    </div>
  );
}
