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

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: config.name ?? 'dearBloom',
  slug: config.slug ?? 'dearbloom-mobile',
  ios: {
    ...config.ios,
    usesAppleSignIn: true,
  },
  plugins: [...googleSignInPlugins, 'expo-apple-authentication'],
});
