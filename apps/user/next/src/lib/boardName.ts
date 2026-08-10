export const BOARD_NAME_MAX_LENGTH = 12;

export const getBoardNameLength = (value: string) => value.replace(/\s/g, '').length;

export function getBoardNameError(value: string, required = false) {
  if (getBoardNameLength(value) > BOARD_NAME_MAX_LENGTH) return `최대 ${BOARD_NAME_MAX_LENGTH}자까지 입력할 수 있어요`;
  if (required && !value.trim()) return '공동보드 이름을 입력하세요';
  return undefined;
}
