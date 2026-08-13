export const NATIVE_SHARE = 'NATIVE_SHARE';

export interface NativeShareRequest {
  type: typeof NATIVE_SHARE;
  title: string;
  text: string;
  url: string;
}

export function parseNativeShareRequest(
  message: string,
  trustedOrigin: string,
): NativeShareRequest | undefined {
  try {
    const value = JSON.parse(message) as Partial<NativeShareRequest>;
    if (
      value.type !== NATIVE_SHARE ||
      typeof value.title !== 'string' ||
      typeof value.text !== 'string' ||
      typeof value.url !== 'string' ||
      new URL(value.url).origin !== trustedOrigin
    ) {
      return undefined;
    }
    return value as NativeShareRequest;
  } catch {
    return undefined;
  }
}

export function getNativeShareContent(
  request: NativeShareRequest,
  platform: 'android' | 'ios',
) {
  return platform === 'ios'
    ? { title: request.title, message: request.text, url: request.url }
    : { title: request.title, message: `${request.text}\n${request.url}` };
}
