/* eslint-disable @typescript-eslint/no-require-imports, no-undef -- Expo config plugin runs as CommonJS. */

const fs = require('node:fs');
const path = require('node:path');

const { withDangerousMod } = require('expo/config-plugins');

const FLAG = '$RNFirebaseDisableSPM = true';

/**
 * react-native-firebase 가 Firebase 를 SPM 으로 가져오지 않게 한다.
 *
 * RNFirebase v22+ 는 기본적으로 Swift Package Manager 로 firebase-ios-sdk 를 해석하는데,
 * SPM 산출물이 automatic library 라 CocoaPods 의 static 링크와 함께 쓰면 각 pod 가 Firebase 사본을
 * 따로 품어 링크 단계에서 중복 심볼로 깨진다.
 *
 * 이 프로젝트는 `use_frameworks!` 없이(= static) Swift pod 을 modular_headers 로 처리하는 구성이라
 * 링크 방식을 바꾸는 대신 SPM 만 끈다. 그러면 Firebase 를 CocoaPods 배포판으로 가져와 기존 구성과 맞는다.
 *
 * Podfile 은 prebuild 마다 새로 생성되므로 수동 편집이 아니라 플러그인으로 넣어야 유지된다.
 */
module.exports = function withRNFirebaseDisableSPM(config) {
  return withDangerousMod(config, [
    'ios',
    (modConfig) => {
      const podfilePath = path.join(modConfig.modRequest.platformProjectRoot, 'Podfile');
      const contents = fs.readFileSync(podfilePath, 'utf8');

      if (contents.includes(FLAG)) return modConfig;

      // 에러 메시지가 요구하는 대로 첫 target 블록보다 앞에 둔다.
      const targetIndex = contents.search(/^target /m);
      if (targetIndex === -1) {
        throw new Error('[withRNFirebaseDisableSPM] Podfile 에서 target 블록을 찾지 못했습니다.');
      }

      fs.writeFileSync(
        podfilePath,
        `${contents.slice(0, targetIndex)}${FLAG}\n\n${contents.slice(targetIndex)}`,
      );

      return modConfig;
    },
  ]);
};
