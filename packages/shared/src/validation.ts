import { z } from 'zod';

/**
 * 공용 입력 유효성 스키마(zod). 폼은 react-hook-form + @hookform/resolvers/zod 로 사용.
 * 프로젝트 내 모든 입력 폼은 이 스키마들을 재사용합니다.
 */

const NICKNAME_MSG = '2-12자의 한글, 영문, 숫자만 가능합니다';

/** 닉네임 / 사용자 이름: 2-12자, 한글·영문·숫자만. (작가 닉네임·고객 이름 공용) */
export const nicknameSchema = z
  .string()
  .trim()
  .min(2, NICKNAME_MSG)
  .max(12, NICKNAME_MSG)
  .regex(/^[가-힣a-zA-Z0-9]+$/, NICKNAME_MSG);
