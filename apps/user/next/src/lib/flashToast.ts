export type FlashToastKind = 'login' | 'logout' | 'profile' | 'welcome' | 'withdrawal';

export function withFlashToast(path: string, kind: FlashToastKind) {
  const url = new URL(path, 'https://dearbloom.local');
  url.searchParams.set('_toast', kind);

  return `${url.pathname}${url.search}${url.hash}`;
}
