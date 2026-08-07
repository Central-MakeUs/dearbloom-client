import { z } from 'zod';

/**
 * 공용 입력 유효성 스키마(zod). 폼은 react-hook-form + @hookform/resolvers/zod 로 사용.
 * 프로젝트 내 모든 입력 폼은 이 스키마들을 재사용합니다.
 */

const NAME_MSG = '이름은 2~12글자 한글 또는 영문만 허용하며, 공백이나 숫자는 입력할 수 없습니다';

/** 작가 이름: 2-12자, 한글 또는 영문(공백·숫자 불가). */
export const nicknameSchema = z
  .string()
  .min(2, NAME_MSG)
  .max(12, NAME_MSG)
  .regex(/^[가-힣a-zA-Z]+$/, NAME_MSG);

/** 고객 이름도 작가 이름과 같은 규칙을 사용. */
export const customerNameSchema = nicknameSchema;
