import assert from 'node:assert/strict';
import test from 'node:test';

import { parseNativeSafeAreaColors } from './nativeSafeArea.ts';

test('safe-area 색상 메시지만 허용한다', () => {
  assert.deepEqual(
    parseNativeSafeAreaColors(
      JSON.stringify({
        bottom: 'rgb(248, 248, 248)',
        top: 'rgb(229, 235, 232)',
        type: 'NATIVE_SAFE_AREA_COLORS',
      }),
    ),
    { bottom: 'rgb(248, 248, 248)', top: 'rgb(229, 235, 232)' },
  );
  assert.equal(parseNativeSafeAreaColors('{'), undefined);
  assert.equal(
    parseNativeSafeAreaColors(
      JSON.stringify({ bottom: 'rgb(999, 0, 0)', top: 'red', type: 'NATIVE_SAFE_AREA_COLORS' }),
    ),
    undefined,
  );
});
