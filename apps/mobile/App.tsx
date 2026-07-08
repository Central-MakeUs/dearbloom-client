import { useState } from 'react';
import { ActivityIndicator, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { WebView } from 'react-native-webview';

const DEFAULT_WEBVIEW_URL = 'https://dev.dearbloom.co.kr/app/home';
const colors = {
  brand: 'rgb(124, 92, 255)',
  ink: 'rgb(17, 20, 24)',
  page: 'rgb(255, 255, 255)',
  sub: 'rgb(107, 114, 128)',
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

export default function App() {
  const webViewUrl = getWebViewUrl();
  const [loadError, setLoadError] = useState<string | null>(null);

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
        source={{ uri: webViewUrl }}
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
