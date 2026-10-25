/** 백엔드가 '없는 작품'이라고 확정한 상태. 400 은 숫자가 아닌 id(/snaps/abc)에서 옵니다. */
const NOT_FOUND_STATUSES = new Set([400, 404, 410]);

/**
 * 페이지 데이터 조회 실패를 응답 코드로 바꿉니다.
 * 404 는 크롤러가 색인에서 지우므로 '없음'이 확실할 때만 쓰고,
 * 429·5xx·네트워크 오류(apiStatus 없음)는 503 으로 두어 나중에 다시 오게 합니다.
 */
export function pageStatusForFetchError(apiStatus: number | undefined): 404 | 503 {
  return apiStatus !== undefined && NOT_FOUND_STATUSES.has(apiStatus) ? 404 : 503;
}
