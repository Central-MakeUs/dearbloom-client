import type { ConfigContext, ExpoConfig } from 'expo/config';

const environment = process.env as Record<string, string | undefined>;
const googleIosClientId = environment.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;
const googleIosClientIdSuffix = '.apps.googleusercontent.com';
const googleIosUrlScheme = googleIosClientId?.endsWith(googleIosClientIdSuffix)
  ? `com.googleusercontent.apps.${googleIosClientId.slice(0, -googleIosClientIdSuffix.length)}`
  : undefined;

const googleSignInPlugins: NonNullable<ExpoConfig['plugins']> = googleIosUrlScheme
  ? [
      [
        '@react-native-google-signin/google-signin',
        {
          iosUrlScheme: googleIosUrlScheme,
        },
      ],
    ]
  : [];

/**
 * 푸시(FCM) 는 iOS 만 켠다.
 *
 * `PUSH_ENABLED=1` 일 때만 Firebase 플러그인을 붙인다. 붙이려면 아래 plist 파일이 있어야 하고,
 * 없으면 prebuild 가 실패한다. 플래그로 나눠 둔 이유는 아직 설정 파일을 받지 않은 사람도
 * 앱을 빌드할 수 있게 하기 위해서다.
 *
 * <b>plist 는 dev/prod Firebase 프로젝트별로 다르다.</b> 브랜치가 아니라 환경변수로 고른다 —
 * 브랜치로 나누면 develop → main 머지마다 이 파일에서 충돌이 난다.
 * 로컬은 `.env.local`, EAS 는 eas.json 의 profile 별 environment 에서 지정한다
 * (`EXPO_PUBLIC_WEBVIEW_URL` 과 같은 방식).
 *
 * plist 는 앱 바이너리에 그대로 박혀 배포되므로 비밀이 아니다 — Google OAuth client ID 와 같은
 * 성격이라 레포에 커밋한다.
 *
 * Android 는 의도적으로 제외한다(`google-services.json` 을 만들지 않는다). 토큰 요청 자체가 일어나지 않아
 * 쓰지도 않을 개인정보를 모으지 않는다.
 */
const googleServicesFile = environment.GOOGLE_SERVICES_PLIST ?? './GoogleService-Info.dev.plist';
const isPushEnabled =
  environment.PUSH_ENABLED === '1' && environment.EAS_BUILD_PLATFORM !== 'android';

const firebasePlugins: NonNullable<ExpoConfig['plugins']> = isPushEnabled
  ? [
      '@react-native-firebase/app',
      '@react-native-firebase/messaging',
      './plugins/withRNFirebaseDisableSPM',
    ]
  : [];

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: config.name ?? 'DearBloom',
  slug: config.slug ?? 'dearbloom-mobile',
  ios: {
    ...config.ios,
    usesAppleSignIn: true,
    ...(isPushEnabled ? { googleServicesFile } : {}),
    entitlements: {
      ...config.ios?.entitlements,
      // 개발 빌드는 development, TestFlight·스토어 빌드는 production 으로 EAS 가 맞춰준다.
      'aps-environment': 'production',
    },
    infoPlist: {
      ...config.ios?.infoPlist,
      LSApplicationQueriesSchemes: ['kakaolink'],
      // 알림 권한은 사용자가 수락한 뒤에만 요청하므로 백그라운드 모드는 remote-notification 만 켠다.
      UIBackgroundModes: ['remote-notification'],
    },
  },
  plugins: [
    [
      'expo-splash-screen',
      {
        // eslint-disable-next-line no-restricted-syntax -- Expo 네이티브 스플래시 설정은 hex 색상을 요구한다.
        backgroundColor: '#E5EBE8',
        image: './assets/loading-content.png',
        imageWidth: 114,
        resizeMode: 'contain',
      },
    ],
    [
      'expo-build-properties',
      {
        ios: {
          // useFrameworks 는 켜지 않는다. react-native-firebase 는 Firebase 를 SPM 으로 가져오는데,
          // static linkage 를 켜면 각 pod 가 Firebase 사본을 따로 품어 링크 단계에서 심볼이 충돌한다.
          // Swift pod 는 아래 modular_headers 로 처리한다.
          extraPods: [
            { name: 'GoogleUtilities', modular_headers: true },
            { name: 'RecaptchaInterop', modular_headers: true },
          ],
        },
      },
    ],
    ...googleSignInPlugins,
    ...firebasePlugins,
    './plugins/withKakaoTalkQuery',
    'expo-apple-authentication',
  ],
});
