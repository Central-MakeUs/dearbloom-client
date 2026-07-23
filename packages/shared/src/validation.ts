import { z } from 'zod';

/**
 * 공용 입력 유효성 스키마(zod). 폼은 react-hook-form + @hookform/resolvers/zod 로 사용.
 * 프로젝트 내 모든 입력 폼은 이 스키마들을 재사용합니다.
 */

const NICKNAME_MSG = '2-12자의 한글, 영문, 숫자만 가능합니다';

/** 작가 닉네임: 2-12자, 한글·영문·숫자. */
export const nicknameSchema = z
  .string()
  .trim()
  .min(2, NICKNAME_MSG)
  .max(12, NICKNAME_MSG)
  .regex(/^[가-힣a-zA-Z0-9]+$/, NICKNAME_MSG);

const CUSTOMER_NAME_MSG = '이름은 2-5자의 한글 또는 영문만 가능합니다';

/** 고객 이름: 2-5자, 한글 또는 영문(숫자 불가). 백엔드 규칙과 일치. */
export const customerNameSchema = z
  .string()
  .trim()
  .min(2, CUSTOMER_NAME_MSG)
  .max(5, CUSTOMER_NAME_MSG)
  .regex(/^[가-힣a-zA-Z]+$/, CUSTOMER_NAME_MSG);
