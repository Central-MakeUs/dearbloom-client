interface KakaoShareLink {
  mobileWebUrl: string;
  webUrl: string;
}

interface KakaoFeedShareOptions {
  objectType: 'feed';
  content: {
    description: string;
    imageHeight?: number;
    imageUrl: string;
    imageWidth?: number;
    link: KakaoShareLink;
    title: string;
  };
  buttons: { link: KakaoShareLink; title: string }[];
}

interface KakaoTextShareOptions {
  objectType: 'text';
  text: string;
  link: KakaoShareLink;
}

interface KakaoSdk {
  init: (key: string) => void;
  isInitialized: () => boolean;
  Share: {
    sendDefault: (options: KakaoFeedShareOptions | KakaoTextShareOptions) => void;
  };
}

declare global {
  interface Window {
    Kakao?: KakaoSdk;
  }
}

type NativeBridgeWindow = Window & {
  ReactNativeWebView?: { postMessage: (message: string) => void };
  __DEARBLOOM_NATIVE_APP__?: { supportsKakaoAvailability?: boolean };
};

const NATIVE_KAKAO_AVAILABILITY = 'NATIVE_KAKAO_AVAILABILITY';
const NATIVE_KAKAO_AVAILABILITY_RESULT = 'NATIVE_KAKAO_AVAILABILITY_RESULT';

let kakaoSdkPromise: Promise<KakaoSdk> | undefined;

export function loadKakaoSdk() {
  if (window.Kakao) return Promise.resolve(window.Kakao);
  if (kakaoSdkPromise) return kakaoSdkPromise;

  kakaoSdkPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://t1.kakaocdn.net/kakao_js_sdk/2.7.4/kakao.min.js';
    script.crossOrigin = 'anonymous';
    script.onload = () =>
      window.Kakao ? resolve(window.Kakao) : reject(new Error('Kakao SDK load failed'));
    script.onerror = () => reject(new Error('Kakao SDK load failed'));
    document.head.appendChild(script);
  });

  return kakaoSdkPromise;
}

export async function copyText(text: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand('copy');
  textarea.remove();
}

export function isShareCancelled(error: unknown) {
  return (
    typeof error === 'object' && error !== null && 'name' in error && error.name === 'AbortError'
  );
}

export function isMobileShareDevice(
  userAgent: string,
  maxTouchPoints: number,
  nativePlatform?: string,
) {
  return (
    nativePlatform === 'ios' ||
    nativePlatform === 'android' ||
    /Android|iPhone|iPad|iPod/i.test(userAgent) ||
    (/Macintosh/i.test(userAgent) && maxTouchPoints > 1)
  );
}

export function getKakaoFeedShareOptions({
  buttonTitle,
  description,
  imageHeight,
  imageUrl,
  imageWidth,
  title,
  url,
}: {
  buttonTitle: string;
  description: string;
  imageHeight?: number;
  imageUrl: string;
  imageWidth?: number;
  title: string;
  url: string;
}): KakaoFeedShareOptions {
  return {
    objectType: 'feed',
    content: {
      description,
      imageUrl,
      ...(imageHeight && imageWidth ? { imageHeight, imageWidth } : {}),
      link: { mobileWebUrl: url, webUrl: url },
      title,
    },
    buttons: [
      {
        title: buttonTitle,
        link: { mobileWebUrl: url, webUrl: url },
      },
    ],
  };
}

export function requestNativeKakaoAvailability() {
  const nativeWindow = window as NativeBridgeWindow;
  const bridge = nativeWindow.ReactNativeWebView;
  if (!nativeWindow.__DEARBLOOM_NATIVE_APP__?.supportsKakaoAvailability || !bridge) {
    return Promise.resolve(undefined);
  }

  return new Promise<boolean>((resolve) => {
    const handleResult = (event: Event) => {
      window.removeEventListener(NATIVE_KAKAO_AVAILABILITY_RESULT, handleResult);
      resolve((event as CustomEvent<{ available: boolean }>).detail.available);
    };

    window.addEventListener(NATIVE_KAKAO_AVAILABILITY_RESULT, handleResult);
    bridge.postMessage(JSON.stringify({ type: NATIVE_KAKAO_AVAILABILITY }));
  });
}
