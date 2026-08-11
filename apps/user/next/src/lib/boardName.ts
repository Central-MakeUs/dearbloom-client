export const BOARD_NAME_MIN_LENGTH = 2;
export const BOARD_NAME_MAX_LENGTH = 12;

export const getBoardNameLength = (value: string) => value.length;

export const isValidBoardName = (value: string) =>
  value.trim().length >= BOARD_NAME_MIN_LENGTH &&
  getBoardNameLength(value) <= BOARD_NAME_MAX_LENGTH;

export function getBoardNameError(value: string, required = false) {
  if (required && value.trim().length < BOARD_NAME_MIN_LENGTH)
    return `최소 ${BOARD_NAME_MIN_LENGTH}자 이상 입력하세요`;
  if (getBoardNameLength(value) > BOARD_NAME_MAX_LENGTH)
    return `최대 ${BOARD_NAME_MAX_LENGTH}자까지 입력할 수 있어요`;
  return undefined;
}
