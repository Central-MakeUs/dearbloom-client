type NativeCookie = { value?: string };
type NativeCookies = Record<string, NativeCookie | undefined>;

export function getSessionWebViewUrl(webViewUrl: string, cookies: NativeCookies) {
  const hasSession = Boolean(cookies.accessToken?.value || cookies.refreshToken?.value);

  if (!hasSession || cookies.activeRole?.value !== 'ARTIST') return webViewUrl;

  const artistUrl = new URL(webViewUrl);
  artistUrl.pathname = '/app/artist/dashboard';
  artistUrl.search = '';
  artistUrl.hash = '';
  return artistUrl.toString();
}
