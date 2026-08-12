export function getInviteWebViewUrl(deepLinkUrl: string, webViewUrl: string) {
  try {
    const deepLink = new URL(deepLinkUrl);
    const inviteCode = decodeURIComponent(deepLink.pathname.slice(1));

    if (
      deepLink.protocol !== 'dearbloom:' ||
      deepLink.hostname !== 'invite' ||
      !inviteCode ||
      inviteCode.includes('/') ||
      inviteCode.length > 128
    ) {
      return undefined;
    }

    const inviteUrl = new URL(webViewUrl);
    inviteUrl.pathname = `/app/invite/${encodeURIComponent(inviteCode)}`;
    inviteUrl.search = '';
    inviteUrl.hash = '';
    return inviteUrl.toString();
  } catch {
    return undefined;
  }
}
