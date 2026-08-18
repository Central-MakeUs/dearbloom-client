export function shouldUseHistoryBack(
  referrer: string,
  fallbackHref: string,
  origin: string,
  historyLength: number,
  historyState?: { dearbloomBackHref?: unknown } | null,
) {
  if (historyLength <= 1) return false;
  if (historyState?.dearbloomBackHref === fallbackHref) return true;
  if (!referrer) return false;

  try {
    const previousUrl = new URL(referrer);
    const fallbackUrl = new URL(fallbackHref, origin);

    return (
      previousUrl.origin === origin &&
      fallbackUrl.origin === origin &&
      previousUrl.pathname === fallbackUrl.pathname &&
      (!fallbackUrl.search || previousUrl.search === fallbackUrl.search)
    );
  } catch {
    return false;
  }
}
