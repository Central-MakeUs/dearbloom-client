import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  BackHandler,
  Linking,
  Platform,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import {
  GoogleSignin,
  isCancelledResponse,
  isSuccessResponse,
} from '@react-native-google-signin/google-signin';
import {
  initialWindowMetrics,
  SafeAreaProvider,
  SafeAreaView,
} from 'react-native-safe-area-context';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';
import CookieManager from '@preeternal/react-native-cookie-manager';
import {
  AuthorizationStatus,
  getInitialNotification,
  getMessaging,
  getToken,
  onNotificationOpenedApp,
  onTokenRefresh,
  requestPermission,
} from '@react-native-firebase/messaging';

import {
  defaultNativeSafeAreaColors,
  nativeSafeAreaSyncScript,
  parseNativeSafeAreaColors,
} from './nativeSafeArea';
import { getInviteWebViewUrl } from './nativeDeepLink';
import {
  createNativeExitRequestScript,
  getAndroidBackAction,
  isNativeExitConfirm,
} from './nativeBack';
import { getSessionWebViewUrl } from './nativeSession';
import { getNativeShareContent, parseNativeShareRequest } from './nativeShare';
import {
  createPushTokenResultScript,
  getPushDeepLinkWebViewUrl,
  isNativePushRegisterRequest,
  NATIVE_PUSH_TOKEN_RESULT,
  type NativePushTokenResult,
} from './nativePush';

const NATIVE_GOOGLE_LOGIN = 'NATIVE_GOOGLE_LOGIN';
const NATIVE_APPLE_LOGIN = 'NATIVE_APPLE_LOGIN';
const NATIVE_SOCIAL_LOGIN_RESULT = 'NATIVE_SOCIAL_LOGIN_RESULT';
const googleWebClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
const googleIosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;
const nativeAppBootstrapScript = `window.__DEARBLOOM_NATIVE_APP__ = Object.freeze({ platform: '${Platform.OS}' }); true;`;
const colors = {
  brand: 'rgb(124, 92, 255)',
  ink: 'rgb(17, 20, 24)',
  page: 'rgb(255, 255, 255)',
  sub: 'rgb(107, 114, 128)',
};

type NativeLoginRequest = typeof NATIVE_APPLE_LOGIN | typeof NATIVE_GOOGLE_LOGIN;
type NativeSocialProvider = 'APPLE' | 'GOOGLE';
type NativeLoginResult = {
  authorizationCode?: string;
  errorCode?: string;
  message?: string;
  provider: NativeSocialProvider;
  socialToken?: string;
  status: 'cancelled' | 'error' | 'success';
  type: typeof NATIVE_SOCIAL_LOGIN_RESULT;
};

type WebViewLoadErrorEvent = {
  nativeEvent: {
    code: number;
    description: string;
    url: string;
  };
};

type WebViewHttpLoadErrorEvent = {
  nativeEvent: {
    statusCode: number;
    url: string;
  };
};

function getWebViewUrl() {
  const webViewUrl = process.env.EXPO_PUBLIC_WEBVIEW_URL;

  if (!webViewUrl) throw new Error('EXPO_PUBLIC_WEBVIEW_URL이 설정되지 않았습니다.');

  return webViewUrl;
}

function parseNativeLoginRequest(message: string): NativeLoginRequest | undefined {
  if (message === NATIVE_APPLE_LOGIN || message === NATIVE_GOOGLE_LOGIN) {
    return message;
  }

  try {
    const parsedMessage = JSON.parse(message) as { type?: unknown };

    return parsedMessage.type === NATIVE_APPLE_LOGIN || parsedMessage.type === NATIVE_GOOGLE_LOGIN
      ? parsedMessage.type
      : undefined;
  } catch {
    return undefined;
  }
}

function isTrustedMessageUrl(messageUrl: string, webViewUrl: string) {
  try {
    return new URL(messageUrl).origin === new URL(webViewUrl).origin;
  } catch {
    return false;
  }
}

function createResultScript(result: NativeLoginResult) {
  const serializedResult = JSON.stringify(result).replace(/</g, '\\u003c');

  return `window.dispatchEvent(new CustomEvent('${NATIVE_SOCIAL_LOGIN_RESULT}', { detail: ${serializedResult} })); true;`;
}

function getErrorCode(error: unknown) {
  return typeof error === 'object' && error !== null && 'code' in error
    ? String(error.code)
    : 'native_login_failed';
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : '네이티브 로그인에 실패했습니다.';
}

async function signInWithGoogle(): Promise<NativeLoginResult> {
  if (!googleWebClientId || (Platform.OS === 'ios' && !googleIosClientId)) {
    return {
      errorCode: 'missing_google_client_id',
      message: 'Google OAuth Client ID가 설정되지 않았습니다.',
      provider: 'GOOGLE',
      status: 'error',
      type: NATIVE_SOCIAL_LOGIN_RESULT,
    };
  }

  try {
    if (Platform.OS === 'android') {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    }

    const response = await GoogleSignin.signIn();

    if (isCancelledResponse(response)) {
      return {
        provider: 'GOOGLE',
        status: 'cancelled',
        type: NATIVE_SOCIAL_LOGIN_RESULT,
      };
    }

    if (!isSuccessResponse(response) || !response.data.serverAuthCode) {
      throw new Error('Google serverAuthCode를 받지 못했습니다.');
    }

    return {
      provider: 'GOOGLE',
      socialToken: response.data.serverAuthCode,
      status: 'success',
      type: NATIVE_SOCIAL_LOGIN_RESULT,
    };
  } catch (error) {
    return {
      errorCode: getErrorCode(error),
      message: getErrorMessage(error),
      provider: 'GOOGLE',
      status: 'error',
      type: NATIVE_SOCIAL_LOGIN_RESULT,
    };
  }
}

async function signInWithApple(): Promise<NativeLoginResult> {
  if (Platform.OS !== 'ios') {
    return {
      errorCode: 'unsupported_platform',
      message: 'Apple 네이티브 로그인은 iOS에서만 지원합니다.',
      provider: 'APPLE',
      status: 'error',
      type: NATIVE_SOCIAL_LOGIN_RESULT,
    };
  }

  try {
    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });

    if (!credential.identityToken) {
      throw new Error('Apple identityToken을 받지 못했습니다.');
    }

    return {
      authorizationCode: credential.authorizationCode ?? undefined,
      provider: 'APPLE',
      socialToken: credential.identityToken,
      status: 'success',
      type: NATIVE_SOCIAL_LOGIN_RESULT,
    };
  } catch (error) {
    const errorCode = getErrorCode(error);

    return {
      errorCode,
      message: errorCode === 'ERR_REQUEST_CANCELED' ? undefined : getErrorMessage(error),
      provider: 'APPLE',
      status: errorCode === 'ERR_REQUEST_CANCELED' ? 'cancelled' : 'error',
      type: NATIVE_SOCIAL_LOGIN_RESULT,
    };
  }
}

/**
 * 알림 권한을 요청하고 FCM 토큰을 얻는다. 요청 시점은 웹이 정한다(로그인 이후) —
 * 첫 실행에 맥락 없이 OS 팝업을 띄우면 심사에서 지적받고, iOS 는 한 번 거부하면 다시 띄울 수 없다.
 *
 * 1차 범위가 iOS 뿐이라 Android 에서는 토큰을 아예 요청하지 않는다(Firebase 설정 파일도 넣지 않는다).
 */
async function requestPushToken(): Promise<NativePushTokenResult> {
  if (Platform.OS !== 'ios') {
    return { status: 'unsupported', type: NATIVE_PUSH_TOKEN_RESULT };
  }

  try {
    const messaging = getMessaging();
    const authorizationStatus = await requestPermission(messaging);
    const isGranted =
      authorizationStatus === AuthorizationStatus.AUTHORIZED ||
      authorizationStatus === AuthorizationStatus.PROVISIONAL;

    if (!isGranted) {
      return { status: 'denied', type: NATIVE_PUSH_TOKEN_RESULT };
    }

    return {
      platform: 'IOS',
      status: 'granted',
      token: await getToken(messaging),
      type: NATIVE_PUSH_TOKEN_RESULT,
    };
  } catch (error) {
    return {
      message: getErrorMessage(error),
      status: 'error',
      type: NATIVE_PUSH_TOKEN_RESULT,
    };
  }
}

export default function App() {
  const initialWebViewUrl = getWebViewUrl();
  const webViewRef = useRef<WebView>(null);
  const canWebViewGoBack = useRef(false);
  const isNativeLoginPending = useRef(false);
  const sessionBootstrapState = useRef<'checking' | 'reading' | 'redirecting' | 'ready'>(
    'checking',
  );
  const [webViewUrl, setWebViewUrl] = useState(initialWebViewUrl);
  const [isSessionReady, setIsSessionReady] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [safeAreaColors, setSafeAreaColors] = useState(defaultNativeSafeAreaColors);

  useEffect(() => {
    if (Platform.OS !== 'android') return;

    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (getAndroidBackAction(canWebViewGoBack.current) === 'go-back') {
        webViewRef.current?.goBack();
        return true;
      }

      webViewRef.current?.injectJavaScript(createNativeExitRequestScript());

      return true;
    });

    return () => subscription.remove();
  }, []);

  useEffect(() => {
    const openDeepLink = (url: string | null) => {
      if (!url) return;

      const inviteWebViewUrl = getInviteWebViewUrl(url, initialWebViewUrl);
      if (!inviteWebViewUrl) return;

      sessionBootstrapState.current = 'ready';
      setIsSessionReady(true);
      setWebViewUrl(inviteWebViewUrl);
    };

    void Linking.getInitialURL().then(openDeepLink);
    const subscription = Linking.addEventListener('url', ({ url }) => openDeepLink(url));

    return () => subscription.remove();
  }, [initialWebViewUrl]);

  // 서버는 data.deepLink 에 내부 절대경로만 담는다. 알림 탭과 인앱 배너 탭이 함께 쓴다.
  const openPushDeepLink = useCallback(
    (deepLink: unknown) => {
      const pushWebViewUrl = getPushDeepLinkWebViewUrl(deepLink, initialWebViewUrl);
      if (!pushWebViewUrl) return;

      sessionBootstrapState.current = 'ready';
      setIsSessionReady(true);
      setWebViewUrl(pushWebViewUrl);
    },
    [initialWebViewUrl],
  );

  // 알림을 탭해 들어온 경우 해당 화면으로 바로 보낸다.
  useEffect(() => {
    if (Platform.OS !== 'ios') return;

    const openFromNotification = (remoteMessage: { data?: Record<string, unknown> } | null) =>
      openPushDeepLink(remoteMessage?.data?.deepLink);
    const messaging = getMessaging();

    // 앱이 종료된 상태에서 알림으로 실행된 경우.
    void getInitialNotification(messaging).then(openFromNotification);

    // 백그라운드에 있다가 알림 탭으로 돌아온 경우.
    return onNotificationOpenedApp(messaging, openFromNotification);
  }, [openPushDeepLink]);

  // 토큰은 재설치·복원 등으로 갱신된다. 갱신되면 웹에 알려 서버 등록을 최신으로 유지한다.
  useEffect(() => {
    if (Platform.OS !== 'ios') return;

    return onTokenRefresh(getMessaging(), (token: string) => {
      webViewRef.current?.injectJavaScript(
        createPushTokenResultScript({
          platform: 'IOS',
          status: 'granted',
          token,
          type: NATIVE_PUSH_TOKEN_RESULT,
        }),
      );
    });
  }, []);

  useEffect(() => {
    if (!googleWebClientId) {
      return;
    }

    GoogleSignin.configure({
      iosClientId: googleIosClientId,
      offlineAccess: true,
      webClientId: googleWebClientId,
    });
  }, []);

  const finishSessionBootstrap = () => {
    sessionBootstrapState.current = 'ready';
    setIsSessionReady(true);
  };

  const handleWebViewLoadEnd = async () => {
    if (sessionBootstrapState.current === 'ready') return;
    if (sessionBootstrapState.current === 'redirecting') {
      finishSessionBootstrap();
      return;
    }
    if (sessionBootstrapState.current !== 'checking') return;

    sessionBootstrapState.current = 'reading';
    try {
      const cookies = await CookieManager.get(initialWebViewUrl, Platform.OS === 'ios');
      const sessionWebViewUrl = getSessionWebViewUrl(initialWebViewUrl, cookies);
      if (sessionWebViewUrl !== initialWebViewUrl) {
        sessionBootstrapState.current = 'redirecting';
        setWebViewUrl(sessionWebViewUrl);
        return;
      }
    } catch {
      // 쿠키 저장소 조회 실패 시 기존 탐색 진입을 유지한다.
    }

    finishSessionBootstrap();
  };

  const handleWebViewMessage = async (event: WebViewMessageEvent) => {
    const { data, url } = event.nativeEvent;

    if (!isTrustedMessageUrl(url, webViewUrl)) {
      return;
    }

    if (Platform.OS === 'android' && isNativeExitConfirm(data)) {
      BackHandler.exitApp();
      return;
    }

    const nextSafeAreaColors = parseNativeSafeAreaColors(data);

    if (nextSafeAreaColors) {
      setSafeAreaColors((currentColors) =>
        currentColors.top === nextSafeAreaColors.top &&
        currentColors.bottom === nextSafeAreaColors.bottom
          ? currentColors
          : nextSafeAreaColors,
      );
      return;
    }

    const shareRequest = parseNativeShareRequest(data, new URL(webViewUrl).origin);
    if (shareRequest) {
      await Share.share(
        getNativeShareContent(shareRequest, Platform.OS === 'ios' ? 'ios' : 'android'),
      );
      return;
    }

    if (isNativePushRegisterRequest(data)) {
      const pushResult = await requestPushToken();
      webViewRef.current?.injectJavaScript(createPushTokenResultScript(pushResult));
      return;
    }

    const request = parseNativeLoginRequest(data);

    if (!request || isNativeLoginPending.current) return;

    isNativeLoginPending.current = true;

    try {
      const result =
        request === NATIVE_GOOGLE_LOGIN ? await signInWithGoogle() : await signInWithApple();
      webViewRef.current?.injectJavaScript(createResultScript(result));
    } finally {
      isNativeLoginPending.current = false;
    }
  };

  const loading = (
    <View style={styles.centered}>
      <ActivityIndicator color={colors.brand} />
      <Text style={styles.loadingText}>dearBloom 로딩 중</Text>
    </View>
  );

  const error = (
    <View style={styles.centered}>
      <Text style={styles.errorTitle}>페이지를 불러오지 못했어요.</Text>
      <Text style={styles.errorText}>네트워크 상태를 확인한 뒤 다시 시도해 주세요.</Text>
      {loadError ? <Text style={styles.errorDetail}>{loadError}</Text> : null}
    </View>
  );

  const topSafeAreaStyle = { backgroundColor: safeAreaColors.top };
  const bottomSafeAreaStyle = { backgroundColor: safeAreaColors.bottom };
  const webViewStyle = [
    styles.webView,
    { backgroundColor: safeAreaColors.top },
    !isSessionReady && styles.hiddenWebView,
  ];
  const webView = (
    <WebView
      ref={webViewRef}
      allowsBackForwardNavigationGestures={Platform.OS === 'ios'}
      injectedJavaScript={nativeSafeAreaSyncScript}
      injectedJavaScriptBeforeContentLoaded={nativeAppBootstrapScript}
      onError={(event: WebViewLoadErrorEvent) => {
        const { code, description, url } = event.nativeEvent;
        setLoadError(`${description} (${code})\n${url}`);
        finishSessionBootstrap();
      }}
      onHttpError={(event: WebViewHttpLoadErrorEvent) => {
        const { statusCode, url } = event.nativeEvent;
        setLoadError(`HTTP ${statusCode}\n${url}`);
      }}
      onLoadStart={() => setLoadError(null)}
      onLoadEnd={handleWebViewLoadEnd}
      onMessage={handleWebViewMessage}
      onNavigationStateChange={({ canGoBack }) => {
        canWebViewGoBack.current = canGoBack;
      }}
      pullToRefreshEnabled={Platform.OS === 'ios'}
      renderError={() => error}
      renderLoading={() => loading}
      sharedCookiesEnabled
      source={{ uri: webViewUrl }}
      startInLoadingState
      style={webViewStyle}
      thirdPartyCookiesEnabled
      webviewDebuggingEnabled={__DEV__}
    />
  );

  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <View style={styles.container}>
        <SafeAreaView edges={['top']} style={topSafeAreaStyle} />
        <SafeAreaView edges={['bottom']} style={[styles.webViewContainer, bottomSafeAreaStyle]}>
          {webView}
          {!isSessionReady ? <View style={styles.startupLoading}>{loading}</View> : null}
        </SafeAreaView>
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.page,
    flex: 1,
  },
  centered: {
    alignItems: 'center',
    backgroundColor: colors.page,
    flex: 1,
    gap: 12,
    justifyContent: 'center',
    padding: 24,
  },
  loadingText: {
    color: colors.sub,
    fontSize: 14,
  },
  errorTitle: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  errorText: {
    color: colors.sub,
    fontSize: 14,
    textAlign: 'center',
  },
  errorDetail: {
    color: colors.sub,
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
  },
  webView: {
    flex: 1,
  },
  hiddenWebView: {
    opacity: 0,
  },
  startupLoading: {
    ...StyleSheet.absoluteFill,
  },
  webViewContainer: {
    flex: 1,
  },
});
