'use client';

import { useEffect, useState } from 'react';

/**
 * persist 스토어(localStorage) 는 클라이언트에서만 값이 채워지므로,
 * 서버 렌더와의 불일치를 피하려면 마운트 이후에만 스토어 값을 렌더한다.
 */
export function useHydrated() {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  return hydrated;
}
