import js from '@eslint/js';
import tseslint from 'typescript-eslint';

/**
 * 헥사코드(예: '#7C5CFF')를 코드에서 직접 사용하면 경고.
 * 색상 토큰은 packages/config/tailwind.preset.mjs 에만 정의하고,
 * 코드에서는 Tailwind 토큰 클래스(예: text-brand, bg-danger)를 사용하세요.
 *
 * 잡히는 케이스:
 * - const c = '#7C5CFF'
 * - <div style={{ color: '#FF0000' }} />
 * - <div className="bg-[#7C5CFF]" />
 * - `background: #123456`
 *
 * 예외적으로 필요한 파일에서는 파일/라인 단위로:
 *   // eslint-disable-next-line no-restricted-syntax
 */
const noHexColor = {
  name: 'dearbloom/no-hex-color',
  rules: {
    'no-restricted-syntax': [
      'warn',
      {
        selector: 'Literal[value=/#[0-9A-Fa-f]{3,8}/]',
        message:
          '헥사코드 직접 사용 금지. 색상은 tailwind.preset.mjs 의 토큰(예: text-brand, bg-danger)을 사용하세요.',
      },
      {
        selector: 'TemplateElement[value.raw=/#[0-9A-Fa-f]{3,8}/]',
        message:
          '헥사코드 직접 사용 금지. 색상은 tailwind.preset.mjs 의 토큰(예: text-brand, bg-danger)을 사용하세요.',
      },
    ],
  },
};

export default [
  // .vercel 은 astro 의 Vercel 어댑터 빌드 산출물 — 한 번이라도 빌드하면 lint 가 그 번들을 훑는다.
  { ignores: ['**/node_modules/**', '**/.next/**', '**/dist/**', '**/.astro/**', '**/.vercel/**'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  noHexColor,
];
