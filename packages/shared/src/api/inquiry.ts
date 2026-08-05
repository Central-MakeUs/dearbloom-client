import { apiGet, apiPatch, apiPost, type RequestOptions } from './http';
import type { DayOfWeek } from './schedule';

/**
 * 문의(Inquiry) API — 고객의 스마트 문의 / 작가가 받은 문의.
 * 상태는 status(코드) + statusLabel(표시용) 로 내려옵니다.
 */

/** 문의 라이프사이클 4상태. 결제가 없어 RESERVED 가 종착 성공 상태입니다. */
export type InquiryStatus = 'IN_PROGRESS' | 'INQUIRY_CANCELED' | 'RESERVED' | 'RESERVATION_CANCELED';

// ---- 고객(Customer) ----

export interface CustomerInquiryListItem {
  inquiryId: number;
  status: InquiryStatus;
  statusLabel: string;
  /** 문의 신청 시각(ISO). 목록/상세의 'NN.NN.NN 문의' 표기에 사용. */
  requestedAt: string;
  artistNickname: string;
  artworkName: string;
  packageName: string;
  artworkImageUrl: string;
  shootDate: string;
  dayOfWeek: DayOfWeek;
  startTime: string;
}

export interface InquiryDetail {
  inquiryId: number;
  status: InquiryStatus;
  /** 문의 신청 시각(ISO) */
  requestedAt: string;
  /** 고객 상세에만 있음(작가 상세엔 customerName 이 옵니다) */
  artistNickname?: string;
  /** 작가 상세에만 있음 */
  customerName?: string;
  /** 작품이 삭제되면 null — 문의는 스냅샷으로 남는다. */
  artworkId: number | null;
  artworkName: string;
  packageName: string;
  price: number;
  headCount: number;
  artworkImageUrl: string;
  shootDate: string;
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  schoolName: string;
  requestNote: string | null;
}

/** 특정 날짜에 예약 가능한 30분 셀들의 시작 시각('HH:MM:SS' 오름차순). */
export interface DayAvailability {
  date: string;
  availableTimes: string[];
}

/** 스마트 문의 화면 진입 시 한 번에 받는 준비 정보(작품·패키지 메타 + 작가 3개월 가용 캘린더). */
export interface InquiryPreparation {
  artworkName: string;
  artistNickname: string;
  artworkImageUrl: string;
  artworkPackageId: number;
  packageName: string;
  price: number;
  durationMinutes: number | null;
  /** 연속으로 선택해야 하는 30분 셀 수 (durationMinutes / 30 올림). */
  requiredSlotCount: number | null;
  /** 슬롯 단위(분). 30 고정. */
  slotStepMinutes: number;
  minHeadCount: number | null;
  /** null 이면 상한 없음. */
  maxHeadCount: number | null;
  availability: DayAvailability[];
}

/**
 * 스마트 문의 전송 payload.
 * 학교는 대학 목록에서 고르면 universityId, 목록에 없어 직접 입력하면 schoolName (둘 중 하나 필수).
 */
export interface InquiryCreatePayload {
  artworkPackageId: number;
  /** 'YYYY-MM-DD' */
  shootDate: string;
  /** 'HH:MM' 또는 'HH:MM:SS' (09:00~21:00, 30분 단위) */
  startTime: string;
  headCount: number;
  universityId?: number;
  schoolName?: string;
  requestNote?: string;
}

/** 전송 완료 화면에 그대로 보여줄 수 있는 문의 스냅샷. */
export interface InquiryCreateResult {
  inquiryId: number;
  /** 문의 전송으로 새로 만들어졌거나 재사용된 채팅방. 전송 완료 후 바로 이동할 수 있다. */
  chatRoomId: number;
  artistNickname: string;
  artworkName: string;
  packageName: string;
  shootDate: string;
  startTime: string;
  durationMinutes: number;
  headCount: number;
  schoolName: string;
  requestNote: string | null;
}

/** 스마트 문의 준비 정보(문의 화면 진입용) */
export function getInquiryPreparation(
  artworkPackageId: number | string,
  opts: RequestOptions,
): Promise<InquiryPreparation> {
  return apiGet<InquiryPreparation>(`/api/inquiries/preparation?artworkPackageId=${artworkPackageId}`, opts);
}

/** 스마트 문의 전송 */
export function createInquiry(payload: InquiryCreatePayload, opts: RequestOptions): Promise<InquiryCreateResult> {
  return apiPost<InquiryCreateResult>('/api/inquiries', payload, opts);
}

/** 내 문의 리스트 */
export function getMyInquiries(opts: RequestOptions): Promise<CustomerInquiryListItem[]> {
  return apiGet<CustomerInquiryListItem[]>('/api/inquiries', opts);
}

/** 내 문의 상세 */
export function getMyInquiry(inquiryId: number | string, opts: RequestOptions): Promise<InquiryDetail> {
  return apiGet<InquiryDetail>(`/api/inquiries/${inquiryId}`, opts);
}

/** 문의 취소(고객) */
export function cancelMyInquiry(inquiryId: number | string, opts: RequestOptions): Promise<void> {
  return apiPatch<void>(`/api/inquiries/${inquiryId}/cancel`, undefined, opts);
}

// ---- 작가(Artist) ----

export interface ArtistInquiryListItem {
  inquiryId: number;
  status: InquiryStatus;
  statusLabel: string;
  /** 문의 신청 시각(ISO) */
  requestedAt: string;
  customerName: string;
  customerImageUrl: string | null;
  artworkName: string;
  packageName: string;
  headCount: number;
  schoolName: string;
  shootDate: string;
  dayOfWeek: DayOfWeek;
  startTime: string;
  durationMinutes: number;
}

/** 문의 상태 변경 이력 1건(타임라인). */
export interface InquiryHistoryItem {
  /** 최초 생성이면 null */
  fromStatus: InquiryStatus | null;
  toStatus: InquiryStatus;
  toStatusLabel: string;
  changedByRole: 'CUSTOMER' | 'ARTIST';
  changedByRoleLabel: string;
  /** 시스템 자동 전이 사유(회원 탈퇴/역할 해지 등). 사용자 조작이면 null */
  reason: string | null;
  changedAt: string;
}

/** 받은 문의 리스트 */
export function getReceivedInquiries(opts: RequestOptions): Promise<ArtistInquiryListItem[]> {
  return apiGet<ArtistInquiryListItem[]>('/api/artists/me/inquiries', opts);
}

/** 받은 문의 상세 */
export function getReceivedInquiry(inquiryId: number | string, opts: RequestOptions): Promise<InquiryDetail> {
  return apiGet<InquiryDetail>(`/api/artists/me/inquiries/${inquiryId}`, opts);
}

/** 받은 문의 상태 변경 이력 */
export function getReceivedInquiryHistory(
  inquiryId: number | string,
  opts: RequestOptions,
): Promise<InquiryHistoryItem[]> {
  return apiGet<InquiryHistoryItem[]>(`/api/artists/me/inquiries/${inquiryId}/history`, opts);
}

/** 예약 완료 */
export function reserveInquiry(inquiryId: number | string, opts: RequestOptions): Promise<void> {
  return apiPatch<void>(`/api/artists/me/inquiries/${inquiryId}/reserve`, undefined, opts);
}

/** 예약 취소 */
export function reserveCancelInquiry(inquiryId: number | string, opts: RequestOptions): Promise<void> {
  return apiPatch<void>(`/api/artists/me/inquiries/${inquiryId}/reserve-cancel`, undefined, opts);
}

/** 문의 취소(작가) */
export function cancelReceivedInquiry(inquiryId: number | string, opts: RequestOptions): Promise<void> {
  return apiPatch<void>(`/api/artists/me/inquiries/${inquiryId}/cancel`, undefined, opts);
}
