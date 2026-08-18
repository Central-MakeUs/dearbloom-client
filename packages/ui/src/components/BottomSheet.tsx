'use client';

import { lazy, Suspense, useEffect, useState } from 'react';
import type { BottomSheetProps } from './BottomSheetImpl';

const BottomSheetImpl = lazy(() =>
  import('./BottomSheetImpl').then((m) => ({ default: m.BottomSheetImpl })),
);

/**
 * 하단 바텀시트 — 실제 구현(vaul)을 지연 로드하는 래퍼.
 *
 * vaul 은 초기 번들에서 gzip 58KB 짜리 공용 청크를 끌고 온다. 시트는 사용자가 눌러야
 * 열리는 것이라 첫 렌더에 있을 필요가 없다.
 *
 * 다만 "열 때 받기" 만 하면 첫 번째 열기에서 올라오는 애니메이션을 놓친다(이미 열린 상태로
 * 마운트되므로). 그래서 유휴 시간에 미리 받아 **닫힌 상태로** 마운트해두고, 그 전에 열리면
 * 그때 받는다. 결과적으로 초기 번들에서는 빠지고 애니메이션은 그대로다.
 */
export function BottomSheet(props: BottomSheetProps) {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const prefetch = () => {
      void import('./BottomSheetImpl').then(() => {
        if (!cancelled) setLoaded(true);
      });
    };

    // requestIdleCallback 이 없는 브라우저(구형 Safari)는 짧은 타이머로 대체.
    const idle = window.requestIdleCallback?.(prefetch);
    const timer = idle === undefined ? window.setTimeout(prefetch, 300) : undefined;

    return () => {
      cancelled = true;
      if (idle !== undefined) window.cancelIdleCallback?.(idle);
      if (timer !== undefined) window.clearTimeout(timer);
    };
  }, []);

  // 아직 안 받았고 닫혀 있으면 그릴 게 없다. 열려 있으면 Suspense 가 받는 동안 기다린다.
  if (!loaded && !props.open) return null;

  return (
    <Suspense fallback={null}>
      <BottomSheetImpl {...props} />
    </Suspense>
  );
}
