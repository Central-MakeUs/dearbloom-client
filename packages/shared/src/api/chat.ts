import { apiGet, apiPost, API_BASE_URL, type RequestOptions } from './http';

/**
 * 채팅(Chat) API — 고객↔작가 1:1. 방은 (고객, 작가) 쌍당 하나이고 문의 전송 시 자동 생성됩니다.
 *
 * 고객/작가는 엔드포인트 prefix 만 다르고 동작이 같아 `role` 로 분기합니다.
 * 메시지 타입에 따라 하나만 채워집니다 — TEXT=content, IMAGE=imageUrl, INQUIRY=inquiryCard.
 */

export type ChatRole = 'CUSTOMER' | 'ARTIST';
export type ChatMessageType = 'TEXT' | 'IMAGE' | 'INQUIRY';

/** 문의 카드(messageType=INQUIRY) 렌더용 스냅샷. '작품상세 보기'는 artworkId 로 이동. */
export interface InquiryCard {
  inquiryId: number;
  artworkId: number;
  artworkName: string;
  packageName: string;
  artistNickname: string;
  shootDate: string;
  startTime: string;
  headCount: number;
  schoolName: string;
  requestNote: string | null;
}

export interface ChatMessage {
  messageId: number;
  senderRole: ChatRole;
  messageType: ChatMessageType;
  content: string | null;
  imageUrl: string | null;
  inquiryCard: InquiryCard | null;
  createdAt: string;
  /** 고객이 조회할 때만 내려옴(말풍선 옆 상대 프로필용) */
  artistNickname?: string;
  artistImageUrl?: string | null;
  /** 작가가 조회할 때만 내려옴 */
  customerName?: string;
}

export interface ChatRoomSummary {
  roomId: number;
  /** 상대 표시명 — 고객이 보면 작가 닉네임, 작가가 보면 고객명. */
  peerName: string;
  peerImageUrl: string | null;
  lastMessagePreview: string | null;
  lastMessageAt: string | null;
  unreadCount: number;
}

/** 역할별 응답 DTO 가 필드명이 달라(작가 닉네임 vs 고객명) 목록은 공통 형태로 정규화합니다. */
interface RawRoomSummary {
  roomId: number;
  artistNickname?: string;
  artistImageUrl?: string | null;
  customerName?: string;
  customerImageUrl?: string | null;
  lastMessagePreview: string | null;
  lastMessageAt: string | null;
  unreadCount: number;
}

const basePath = (role: ChatRole) => (role === 'CUSTOMER' ? '/api/customers/me/chat' : '/api/artists/me/chat');

function toRoomSummary(raw: RawRoomSummary): ChatRoomSummary {
  return {
    roomId: raw.roomId,
    peerName: raw.artistNickname ?? raw.customerName ?? '',
    peerImageUrl: raw.artistImageUrl ?? raw.customerImageUrl ?? null,
    lastMessagePreview: raw.lastMessagePreview,
    lastMessageAt: raw.lastMessageAt,
    unreadCount: raw.unreadCount,
  };
}

/** 내 채팅방 목록(최근 메시지순). */
export async function getChatRooms(role: ChatRole, opts: RequestOptions): Promise<ChatRoomSummary[]> {
  const rooms = await apiGet<RawRoomSummary[]>(`${basePath(role)}/rooms`, opts);
  return rooms.map(toRoomSummary);
}

/**
 * 메시지 히스토리 — 최신부터 size 개를 조회해 화면 표시용(오래된→최신) 순서로 내려옵니다.
 * 위로 더 불러올 땐 받은 첫 메시지의 messageId 를 cursor 로 넘기세요.
 */
export function getChatMessages(
  role: ChatRole,
  roomId: number | string,
  params: { cursor?: number; size?: number },
  opts: RequestOptions,
): Promise<ChatMessage[]> {
  const qs = new URLSearchParams();
  if (params.cursor !== undefined) qs.set('cursor', String(params.cursor));
  if (params.size !== undefined) qs.set('size', String(params.size));
  const query = qs.size > 0 ? `?${qs.toString()}` : '';
  return apiGet<ChatMessage[]>(`${basePath(role)}/rooms/${roomId}/messages${query}`, opts);
}

/** 텍스트 메시지 전송. 저장된 메시지를 돌려주고 구독자에게 브로드캐스트됩니다. */
export function sendChatText(
  role: ChatRole,
  roomId: number | string,
  content: string,
  opts: RequestOptions,
): Promise<ChatMessage> {
  return apiPost<ChatMessage>(`${basePath(role)}/rooms/${roomId}/messages`, { content }, opts);
}

/** 이미지 메시지 전송(한 장). presigned(prefix=CHAT_IMAGE) 업로드로 받은 CDN URL 을 넘깁니다. */
export function sendChatImage(
  role: ChatRole,
  roomId: number | string,
  imageUrl: string,
  opts: RequestOptions,
): Promise<ChatMessage> {
  return apiPost<ChatMessage>(`${basePath(role)}/rooms/${roomId}/images`, { imageUrl }, opts);
}

/** 읽음 처리(내 쪽 안읽음 0). 보통 방 진입 시 호출합니다. */
export function markChatRead(role: ChatRole, roomId: number | string, opts: RequestOptions): Promise<void> {
  return apiPost<void>(`${basePath(role)}/rooms/${roomId}/read`, undefined, opts);
}

/**
 * STOMP 핸드셰이크 URL. 인증은 handshake 에 실리는 httpOnly accessToken 쿠키로 이뤄지므로
 * 프론트와 API 가 같은 사이트(.dearbloom.co.kr)일 때만 성립합니다 — localhost 개발 중엔 연결이 거부됩니다.
 */
export const CHAT_WS_URL = `${API_BASE_URL.replace(/^http/, 'ws')}/ws`;

/** 방 브로드캐스트 토픽. */
export const chatRoomTopic = (roomId: number | string) => `/topic/rooms/${roomId}`;
