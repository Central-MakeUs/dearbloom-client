import { z } from 'zod';

/**
 * 공용 입력 유효성 스키마(zod). 폼은 react-hook-form + @hookform/resolvers/zod 로 사용.
 * 프로젝트 내 모든 입력 폼은 이 스키마들을 재사용합니다.
 */

const NICKNAME_MSG = '닉네임은 2~12자의 한글, 영문, 숫자, _ 와 단어 사이 공백만 가능합니다';

/**
 * 작가 닉네임: 2-12자(공백 포함), 한글·영문·숫자·`_` + 단어 사이 공백 1칸.
 * 상호명("김은아 스냅")을 쓰는 작가가 많아 공백을 허용합니다 — 서버 규칙과 동일하게 맞춘 것이라
 * 앞뒤 공백과 연속 공백은 서버에서도 거부되므로 여기서도 막습니다.
 */
export const nicknameSchema = z
  .string()
  .min(2, NICKNAME_MSG)
  .max(12, NICKNAME_MSG)
  .regex(/^[가-힣a-zA-Z0-9_]+(?: [가-힣a-zA-Z0-9_]+)*$/, NICKNAME_MSG);

/** 고객 이름 최대 길이 — Figma 프로필 수정 화면의 글자수 카운터(n/5) 기준. */
export const CUSTOMER_NAME_MAX_LENGTH = 5;

const CUSTOMER_NAME_MSG = `이름은 2~${CUSTOMER_NAME_MAX_LENGTH}글자 한글 또는 영문만 허용하며, 공백이나 숫자는 입력할 수 없습니다`;

/** 고객 이름: 2-5자, 한글 또는 영문(공백·숫자 불가). 작가 이름(2-12자)보다 짧습니다. */
export const customerNameSchema = z
  .string()
  .min(2, CUSTOMER_NAME_MSG)
  .max(CUSTOMER_NAME_MAX_LENGTH, CUSTOMER_NAME_MSG)
  .regex(/^[가-힣a-zA-Z]+$/, CUSTOMER_NAME_MSG);
