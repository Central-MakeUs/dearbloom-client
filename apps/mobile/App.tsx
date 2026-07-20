import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Platform, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import {
  GoogleSignin,
  isCancelledResponse,
  isSuccessResponse,
} from '@react-native-google-signin/google-signin';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';

const DEFAULT_WEBVIEW_URL = 'https://dearbloom.co.kr/app';
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
  return process.env.EXPO_PUBLIC_WEBVIEW_URL ?? DEFAULT_WEBVIEW_URL;
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

export default function App() {
  const webViewUrl = getWebViewUrl();
  const webViewRef = useRef<WebView>(null);
  const isNativeLoginPending = useRef(false);
  const [loadError, setLoadError] = useState<string | null>(null);

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

  const handleWebViewMessage = async (event: WebViewMessageEvent) => {
    const { data, url } = event.nativeEvent;
    const request = parseNativeLoginRequest(data);

    if (!request || !isTrustedMessageUrl(url, webViewUrl) || isNativeLoginPending.current) {
      return;
    }

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

  return (
    <SafeAreaView style={styles.container}>
      <WebView
        ref={webViewRef}
        source={{ uri: webViewUrl }}
        injectedJavaScriptBeforeContentLoaded={nativeAppBootstrapScript}
        startInLoadingState
        renderLoading={() => loading}
        renderError={() => error}
        onLoadStart={() => setLoadError(null)}
        onError={(event: WebViewLoadErrorEvent) => {
          const { code, description, url } = event.nativeEvent;
          setLoadError(`${description} (${code})\n${url}`);
        }}
        onHttpError={(event: WebViewHttpLoadErrorEvent) => {
          const { statusCode, url } = event.nativeEvent;
          setLoadError(`HTTP ${statusCode}\n${url}`);
        }}
        onMessage={handleWebViewMessage}
        sharedCookiesEnabled
        thirdPartyCookiesEnabled
      />
    </SafeAreaView>
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
});
