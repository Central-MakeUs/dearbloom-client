import { apiGet, apiPatch, type RequestOptions } from './http';
import type { DayOfWeek } from './schedule';

/**
 * 문의(Inquiry) API — 고객의 스마트 문의 / 작가가 받은 문의.
 * 상태는 status(코드) + statusLabel(표시용) 로 내려옵니다.
 */

// ---- 고객(Customer) ----

export interface CustomerInquiryListItem {
  inquiryId: number;
  status: string;
  statusLabel: string;
  artistNickname: string;
  artworkName: string;
  artworkImageUrl: string;
  shootDate: string;
  dayOfWeek: DayOfWeek;
  startTime: string;
}

export interface InquiryDetail {
  inquiryId: number;
  /** 고객 상세에만 있음(작가 상세엔 없음) */
  artistNickname?: string;
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
  status: string;
  statusLabel: string;
  artworkName: string;
  packageName: string;
  headCount: number;
  schoolName: string;
  shootDate: string;
  dayOfWeek: DayOfWeek;
  startTime: string;
  durationMinutes: number;
}

/** 받은 문의 리스트 */
export function getReceivedInquiries(opts: RequestOptions): Promise<ArtistInquiryListItem[]> {
  return apiGet<ArtistInquiryListItem[]>('/api/artists/me/inquiries', opts);
}

/** 받은 문의 상세 */
export function getReceivedInquiry(inquiryId: number | string, opts: RequestOptions): Promise<InquiryDetail> {
  return apiGet<InquiryDetail>(`/api/artists/me/inquiries/${inquiryId}`, opts);
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
