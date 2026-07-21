import { apiPost, type RequestOptions } from './http';

/** 파일 업로드 — presigned URL 발급 후 그 URL 로 직접 PUT. */

export type FilePrefix = 'REVIEW' | 'PORTFOLIO' | 'ARTIST_IMAGE';

export interface PresignedUrl {
  presignedUrl: string;
  fileUrl: string;
}

/** 업로드용 presigned URL 발급 (로그인 필요). */
export function getPresignedUrl(
  payload: { prefix: FilePrefix; fileName: string },
  opts: RequestOptions,
): Promise<PresignedUrl> {
  return apiPost<PresignedUrl>('/api/files/presigned-url', payload, opts);
}
