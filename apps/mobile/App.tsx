import { useCallback, useEffect, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  Alert,
  Animated,
  BackHandler,
  Easing,
  Image,
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
import notifee, {
  AndroidImportance,
  AuthorizationStatus as NotifeeAuthorizationStatus,
  EventType,
} from '@notifee/react-native';
import {
  AuthorizationStatus,
  getInitialNotification,
  getMessaging,
  getToken,
  onMessage,
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
import { getAndroidBackAction, parseNativeNavigationState } from './nativeBack';
import { getSessionWebViewUrl } from './nativeSession';
import { getNativeShareContent, parseNativeShareRequest } from './nativeShare';
import {
  createNativeKakaoAvailabilityResultScript,
  isNativeKakaoAvailabilityRequest,
} from './nativeKakao';
import {
  createPushTokenResultScript,
  getPushDeepLinkWebViewUrl,
  isNativePushRegisterRequest,
  ANDROID_CHANNEL_ID,
  ANDROID_CHANNEL_NAME,
  getPushBannerContent,
  NATIVE_PUSH_TOKEN_RESULT,
  type NativePushPlatform,
  type NativePushTokenResult,
} from './nativePush';

const NATIVE_GOOGLE_LOGIN = 'NATIVE_GOOGLE_LOGIN';
const NATIVE_APPLE_LOGIN = 'NATIVE_APPLE_LOGIN';
const NATIVE_SOCIAL_LOGIN_RESULT = 'NATIVE_SOCIAL_LOGIN_RESULT';
const googleWebClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
const googleIosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;
// 푸시는 iOS·Android 만 지원한다(웹 프리뷰 등 그 외 플랫폼에서는 Firebase 모듈이 없다).
const isPushSupported = Platform.OS === 'ios' || Platform.OS === 'android';
const pushPlatform: NativePushPlatform = Platform.OS === 'android' ? 'ANDROID' : 'IOS';
const nativeAppBootstrapScript = `window.__DEARBLOOM_NATIVE_APP__ = Object.freeze({ platform: '${Platform.OS}', supportsKakaoAvailability: true }); true;`;
// eslint-disable-next-line @typescript-eslint/no-require-imports -- Metro 정적 이미지 에셋은 require로 해석한다.
const loadingLabelImage = require('./assets/loading-label.png');
// eslint-disable-next-line @typescript-eslint/no-require-imports -- Metro 정적 이미지 에셋은 require로 해석한다.
const loadingSymbolImage = require('./assets/loading-symbol.png');
const colors = {
  ink: 'rgb(17, 20, 24)',
  loading: 'rgb(229, 235, 232)',
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

function LoadingView() {
  const rotation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let animation: Animated.CompositeAnimation | undefined;
    let mounted = true;

    void AccessibilityInfo.isReduceMotionEnabled().then((reduceMotionEnabled) => {
      if (!mounted || reduceMotionEnabled) return;

      animation = Animated.loop(
        Animated.timing(rotation, {
          duration: 1000,
          easing: Easing.linear,
          toValue: 1,
          useNativeDriver: true,
        }),
      );
      animation.start();
    });

    return () => {
      mounted = false;
      animation?.stop();
    };
  }, [rotation]);

  const rotate = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });
  const symbol = (
    <Animated.View style={{ transform: [{ rotate }] }}>
      <Image accessible={false} source={loadingSymbolImage} style={styles.loadingSymbol} />
    </Animated.View>
  );
  const label = (
    <View style={styles.loadingLabel}>
      <Image accessible={false} source={loadingLabelImage} style={styles.loadingLabelImage} />
    </View>
  );

  return (
    <View
      accessibilityLabel="DearBloom 로딩 중"
      accessibilityRole="progressbar"
      accessible
      style={styles.loading}
    >
      {symbol}
      {label}
    </View>
  );
}

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
 * <b>플랫폼마다 권한 요청 주체가 다르다.</b> RNFirebase 의 requestPermission 은 Android 에서
 * 아무 일도 하지 않고 무조건 AUTHORIZED 를 돌려준다(네이티브 구현이 `promise.resolve(1)` 뿐).
 * 그대로 쓰면 POST_NOTIFICATIONS 팝업 없이 허용된 것으로 착각해, 사용자가 설정에서 직접 켜기 전에는
 * 알림이 오지 않는다. Android 13+ 의 런타임 권한은 notifee 가 요청한다.
 */
/** iOS 알림 권한. RNFirebase 가 UNUserNotificationCenter 로 시스템 팝업을 띄운다. */
async function requestIosPermission() {
  const authorizationStatus = await requestPermission(getMessaging());

  return (
    authorizationStatus === AuthorizationStatus.AUTHORIZED ||
    authorizationStatus === AuthorizationStatus.PROVISIONAL
  );
}

async function requestPushToken(): Promise<NativePushTokenResult> {
  if (!isPushSupported) {
    return { status: 'unsupported', type: NATIVE_PUSH_TOKEN_RESULT };
  }

  try {
    const isGranted =
      Platform.OS === 'android'
        ? (await notifee.requestPermission()).authorizationStatus >=
          NotifeeAuthorizationStatus.AUTHORIZED
        : await requestIosPermission();

    if (!isGranted) {
      return { status: 'denied', type: NATIVE_PUSH_TOKEN_RESULT };
    }

    const messaging = getMessaging();

    return {
      platform: pushPlatform,
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
  const hasAppNavigationBack = useRef(false);
  const hasWebViewBack = useRef(false);
  const isNativeLoginPending = useRef(false);
  const sessionBootstrapState = useRef<'checking' | 'reading' | 'redirecting' | 'ready'>(
    'checking',
  );
  const [webViewUrl, setWebViewUrl] = useState(initialWebViewUrl);
  const [webViewKey, setWebViewKey] = useState(0);
  const [isSessionReady, setIsSessionReady] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [safeAreaColors, setSafeAreaColors] = useState(defaultNativeSafeAreaColors);

  const replaceWebViewRoot = useCallback((url: string) => {
    hasAppNavigationBack.current = false;
    hasWebViewBack.current = false;
    setWebViewUrl(url);
    setWebViewKey((currentKey) => currentKey + 1);
  }, []);

  useEffect(() => {
    if (Platform.OS !== 'android') return;

    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (
        getAndroidBackAction(hasAppNavigationBack.current, hasWebViewBack.current) === 'go-back'
      ) {
        webViewRef.current?.goBack();
        return true;
      }

      Alert.alert('디어블룸을 종료할까요?', '진행 중인 화면은 그대로 저장되지 않을 수 있어요.', [
        { style: 'cancel', text: '취소' },
        { onPress: () => BackHandler.exitApp(), style: 'destructive', text: '종료' },
      ]);

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
      replaceWebViewRoot(inviteWebViewUrl);
    };

    void Linking.getInitialURL().then(openDeepLink);
    const subscription = Linking.addEventListener('url', ({ url }) => openDeepLink(url));

    return () => subscription.remove();
  }, [initialWebViewUrl, replaceWebViewRoot]);

  // 서버는 data.deepLink 에 내부 절대경로만 담는다. 알림 탭과 인앱 배너 탭이 함께 쓴다.
  const openPushDeepLink = useCallback(
    (deepLink: unknown) => {
      const pushWebViewUrl = getPushDeepLinkWebViewUrl(deepLink, initialWebViewUrl);
      if (!pushWebViewUrl) return;

      sessionBootstrapState.current = 'ready';
      setIsSessionReady(true);
      replaceWebViewRoot(pushWebViewUrl);
    },
    [initialWebViewUrl, replaceWebViewRoot],
  );

  // 알림을 탭해 들어온 경우 해당 화면으로 바로 보낸다.
  useEffect(() => {
    if (!isPushSupported) return;

    const openFromNotification = (remoteMessage: { data?: Record<string, unknown> } | null) =>
      openPushDeepLink(remoteMessage?.data?.deepLink);
    const messaging = getMessaging();

    // 앱이 종료된 상태에서 알림으로 실행된 경우.
    void getInitialNotification(messaging).then(openFromNotification);

    // 백그라운드에 있다가 알림 탭으로 돌아온 경우.
    return onNotificationOpenedApp(messaging, openFromNotification);
  }, [openPushDeepLink]);

  // Android 알림 채널 생성. 채널이 없으면 Android 8+ 는 알림을 표시하지 않는다.
  // 서버가 보내는 channel_id 와 같은 ID 여야 한다(ANDROID_CHANNEL_ID).
  useEffect(() => {
    if (Platform.OS !== 'android') return;

    void notifee.createChannel({
      id: ANDROID_CHANNEL_ID,
      importance: AndroidImportance.HIGH,
      name: ANDROID_CHANNEL_NAME,
    });
  }, []);

  // notifee 로 띄운 알림을 탭했을 때. FCM 이 직접 띄운 알림은 onNotificationOpenedApp 이 받는다.
  useEffect(() => {
    if (Platform.OS !== 'android') return;

    return notifee.onForegroundEvent(({ detail, type }) => {
      if (type !== EventType.PRESS) return;
      openPushDeepLink(detail.notification?.data?.deepLink);
    });
  }, [openPushDeepLink]);

  // Android 포그라운드 수신. iOS 는 firebase.json 의 presentation options 로 시스템이 표시하지만,
  // Android 에는 대응 옵션이 없어 앱이 떠 있는 동안 온 알림이 그냥 사라진다 — 셸이 직접 배너를 그린다.
  useEffect(() => {
    if (Platform.OS !== 'android') return;

    return onMessage(getMessaging(), (remoteMessage: unknown) => {
      const content = getPushBannerContent(remoteMessage);
      if (!content) return;

      void notifee.displayNotification({
        android: { channelId: ANDROID_CHANNEL_ID, pressAction: { id: 'default' } },
        body: content.body,
        data: content.deepLink ? { deepLink: content.deepLink } : undefined,
        title: content.title,
      });
    });
  }, []);

  // 토큰은 재설치·복원 등으로 갱신된다. 갱신되면 웹에 알려 서버 등록을 최신으로 유지한다.
  useEffect(() => {
    if (!isPushSupported) return;

    return onTokenRefresh(getMessaging(), (token: string) => {
      webViewRef.current?.injectJavaScript(
        createPushTokenResultScript({
          platform: pushPlatform,
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
        replaceWebViewRoot(sessionWebViewUrl);
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

    const nativeNavigationState = parseNativeNavigationState(data);
    if (nativeNavigationState !== undefined) {
      hasAppNavigationBack.current = nativeNavigationState;
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

    if (isNativeKakaoAvailabilityRequest(data)) {
      const available = await Linking.canOpenURL('kakaolink://').catch(() => false);
      webViewRef.current?.injectJavaScript(createNativeKakaoAvailabilityResultScript(available));
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

  const loading = <LoadingView />;

  const error = (
    <View style={styles.centered}>
      <Text style={styles.errorTitle}>페이지를 불러오지 못했어요.</Text>
      <Text style={styles.errorText}>네트워크 상태를 확인한 뒤 다시 시도해 주세요.</Text>
      {loadError ? <Text style={styles.errorDetail}>{loadError}</Text> : null}
    </View>
  );

  const topSafeAreaStyle = {
    backgroundColor: isSessionReady ? safeAreaColors.top : colors.loading,
  };
  const bottomSafeAreaStyle = {
    backgroundColor: isSessionReady ? safeAreaColors.bottom : colors.loading,
  };
  const webViewStyle = [
    styles.webView,
    { backgroundColor: safeAreaColors.top },
    !isSessionReady && styles.hiddenWebView,
  ];
  const webView = (
    <WebView
      key={webViewKey}
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
      onLoadStart={() => {
        hasAppNavigationBack.current = false;
        setLoadError(null);
      }}
      onLoadEnd={handleWebViewLoadEnd}
      onMessage={handleWebViewMessage}
      onNavigationStateChange={({ canGoBack, url }) => {
        hasWebViewBack.current = canGoBack && isTrustedMessageUrl(url, initialWebViewUrl);
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
  loading: {
    alignItems: 'center',
    backgroundColor: colors.loading,
    flex: 1,
    gap: 12,
    justifyContent: 'center',
  },
  loadingLabel: {
    alignItems: 'center',
    height: 21,
    justifyContent: 'center',
    width: 114,
  },
  loadingLabelImage: {
    height: 13,
    width: 112,
  },
  loadingSymbol: {
    height: 32,
    width: 31,
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
