/**
 * PC(lg 이상)에서 375px 고정 흐름 화면(로그인·온보딩·약관·역할 선택·초대·문의 작성)을
 * 가운데 카드로 담는 클래스.
 *
 * 이 화면들은 Figma 375 프레임 기준으로 절대배치·하단 고정 버튼을 쓰므로 폭을 늘리면 깨진다.
 * 그래서 폭은 그대로 두고 PC 에선 회색 배경 위 카드 한 장으로 보여준다.
 *
 * - `<main>` 에 PC_FLOW_BACKDROP, 안쪽 375 프레임에 PC_FLOW_CARD + 카드 배경색(`lg:bg-*`).
 * - 프레임 안의 `fixed` 하단 버튼은 `lg:absolute` 로 바꿔 카드 바닥에 붙인다(카드가 relative).
 *   내용이 카드보다 길어지는 화면은 `lg:sticky` 로 두고 카드를 `lg:overflow-clip` 으로
 *   (`overflow-hidden` 은 스크롤 컨테이너가 돼 sticky 가 화면 바닥에 붙지 않는다).
 * - 헤더는 `staticOnPc` 로 카드 안에 둔다.
 */
export const PC_FLOW_BACKDROP = 'lg:flex lg:items-center lg:justify-center lg:bg-neutral-200 lg:py-10';

/** 카드 최소 높이 — 모바일의 min-h-dvh 대신. 프레임 안에서 화면 높이를 채우던 요소도 이 값을 쓴다. */
export const PC_FLOW_MIN_H = 'lg:min-h-[min(780px,calc(100dvh-80px))]';

export const PC_FLOW_CARD = `lg:relative lg:w-[375px] lg:rounded-xl lg:shadow-elevation ${PC_FLOW_MIN_H}`;
