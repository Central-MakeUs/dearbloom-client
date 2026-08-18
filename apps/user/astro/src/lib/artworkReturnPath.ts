const SHARED_BOARD_PATH = /^\/app\/boards\/[1-9]\d*$/;

export const getArtworkBackHref = (returnTo: string | null) =>
  returnTo && SHARED_BOARD_PATH.test(returnTo) ? returnTo : '/snaps';

export const shouldUseArtworkHistoryBack = (
  referrer: string,
  currentPath: string,
  origin: string,
  historyLength: number,
) => {
  if (!referrer || historyLength <= 1) return false;

  try {
    const referrerUrl = new URL(referrer);
    return referrerUrl.origin === origin && !referrerUrl.pathname.startsWith(`${currentPath}/images`);
  } catch {
    return false;
  }
};
