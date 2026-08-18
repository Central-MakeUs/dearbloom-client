import assert from 'node:assert/strict';
import test from 'node:test';
import {
  getKakaoFeedShareOptions,
  isMobileShareDevice,
  isShareCancelled,
  requestNativeKakaoAvailability,
} from '../../../../../packages/shared/src/webShare.ts';

test('공유 취소만 오류 토스트 대상에서 제외한다', () => {
  assert.equal(isShareCancelled({ name: 'AbortError' }), true);
  assert.equal(isShareCancelled({ name: 'NotAllowedError' }), false);
});

test('카카오 공유는 모바일과 네이티브 앱에서만 노출한다', () => {
  assert.equal(isMobileShareDevice('Mozilla/5.0 (Macintosh)', 0), false);
  assert.equal(isMobileShareDevice('Mozilla/5.0 (Linux; Android 15)', 5), true);
  assert.equal(isMobileShareDevice('Mozilla/5.0 (Macintosh)', 5), true);
  assert.equal(isMobileShareDevice('Mozilla/5.0', 0, 'ios'), true);
});

test('카카오 피드 공유에 이미지와 이동 버튼을 구성한다', () => {
  const url = 'https://dearbloom.co.kr/app/invite/ABC123';

  assert.deepEqual(
    getKakaoFeedShareOptions({
      buttonTitle: '공동보드 참여하기',
      description: '친구들과 후보를 모아 보세요.',
      imageHeight: 214,
      imageUrl: 'https://dearbloom.co.kr/app/images/kakao-board-invite.png',
      imageWidth: 428,
      title: '우정 공동보드에 초대되었어요',
      url,
    }),
    {
      objectType: 'feed',
      content: {
        description: '친구들과 후보를 모아 보세요.',
        imageHeight: 214,
        imageUrl: 'https://dearbloom.co.kr/app/images/kakao-board-invite.png',
        imageWidth: 428,
        link: { mobileWebUrl: url, webUrl: url },
        title: '우정 공동보드에 초대되었어요',
      },
      buttons: [
        {
          link: { mobileWebUrl: url, webUrl: url },
          title: '공동보드 참여하기',
        },
      ],
    },
  );

  const artworkOptions = getKakaoFeedShareOptions({
    buttonTitle: '작품 자세히 보기',
    description: '작품을 확인해 보세요.',
    imageUrl: 'https://cdn.dearbloom.co.kr/artwork.jpg',
    title: '졸업 작품',
    url: 'https://dearbloom.co.kr/snaps/1',
  });
  assert.equal('imageWidth' in artworkOptions.content, false);
  assert.equal('imageHeight' in artworkOptions.content, false);
});

test('네이티브 앱에서 카카오톡 미설치 결과를 받는다', async () => {
  const eventTarget = new EventTarget();
  const messages: string[] = [];
  const originalWindow = globalThis.window;
  globalThis.window = {
    __DEARBLOOM_NATIVE_APP__: { supportsKakaoAvailability: true },
    ReactNativeWebView: {
      postMessage(message: string) {
        messages.push(message);
        const event = new Event('NATIVE_KAKAO_AVAILABILITY_RESULT');
        Object.defineProperty(event, 'detail', { value: { available: false } });
        eventTarget.dispatchEvent(event);
      },
    },
    addEventListener: eventTarget.addEventListener.bind(eventTarget),
    removeEventListener: eventTarget.removeEventListener.bind(eventTarget),
  } as unknown as Window & typeof globalThis;

  try {
    assert.equal(await requestNativeKakaoAvailability(), false);
    assert.deepEqual(JSON.parse(messages[0]!), { type: 'NATIVE_KAKAO_AVAILABILITY' });
  } finally {
    globalThis.window = originalWindow;
  }
});
