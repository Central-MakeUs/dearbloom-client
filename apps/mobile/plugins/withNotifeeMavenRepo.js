/* eslint-disable @typescript-eslint/no-require-imports, no-undef -- Expo config plugin runs as CommonJS. */

const { withProjectBuildGradle } = require('expo/config-plugins');

const REPO_MARKER = '@notifee/react-native/android/libs';
const REPO_BLOCK = `    maven { url "$rootDir/../node_modules/${REPO_MARKER}" }`;

/**
 * notifee 의 안드로이드 아티팩트({@code app.notifee:core})가 있는 로컬 Maven 저장소를 등록한다.
 *
 * notifee 는 이 아티팩트를 npm 패키지 안에 동봉해 배포한다. Maven Central 이나 Google 저장소에는
 * 없어서, 등록하지 않으면 "Could not find any matches for app.notifee:core" 로 빌드가 깨진다.
 *
 * android/build.gradle 은 prebuild 마다 새로 생성되므로 수동 편집이 아니라 플러그인으로 넣어야 유지된다.
 */
module.exports = function withNotifeeMavenRepo(config) {
  return withProjectBuildGradle(config, (modConfig) => {
    if (modConfig.modResults.contents.includes(REPO_MARKER)) return modConfig;

    // allprojects 의 repositories 블록에만 넣는다(buildscript 쪽이 아니라).
    modConfig.modResults.contents = modConfig.modResults.contents.replace(
      /allprojects\s*\{\s*\n(\s*)repositories\s*\{\n/,
      (match) => `${match}${REPO_BLOCK}\n`,
    );

    if (!modConfig.modResults.contents.includes(REPO_MARKER)) {
      throw new Error('[withNotifeeMavenRepo] allprojects.repositories 블록을 찾지 못했습니다.');
    }

    return modConfig;
  });
};
