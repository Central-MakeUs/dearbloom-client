/* eslint-disable @typescript-eslint/no-require-imports, no-undef -- Expo config plugin runs as CommonJS. */

const { withAndroidManifest } = require('expo/config-plugins');

module.exports = function withKakaoTalkQuery(config) {
  return withAndroidManifest(config, (modConfig) => {
    const manifest = modConfig.modResults.manifest;
    const queries = (manifest.queries ??= []);
    const hasKakaoTalk = queries.some((query) =>
      query.package?.some((entry) => entry.$?.['android:name'] === 'com.kakao.talk'),
    );

    if (!hasKakaoTalk) {
      queries.push({ package: [{ $: { 'android:name': 'com.kakao.talk' } }] });
    }

    return modConfig;
  });
};
