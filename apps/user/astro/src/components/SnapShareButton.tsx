import { useEffect, useState } from 'react';
import { Share } from 'lucide-react';
import { ShareBottomSheet, showToast } from '@dearbloom/ui';
import {
  copyText,
  getKakaoFeedShareOptions,
  isMobileShareDevice,
  isShareCancelled,
  loadKakaoSdk,
  requestNativeKakaoAvailability,
} from '@dearbloom/shared';

declare global {
  interface Window {
    __DEARBLOOM_NATIVE_APP__?: {
      platform?: string;
      supportsKakaoAvailability?: boolean;
    };
    ReactNativeWebView?: { postMessage: (message: string) => void };
  }
}

export function SnapShareButton({
  imageUrl,
  kakaoKey,
  title,
}: {
  imageUrl?: string;
  kakaoKey?: string;
  title: string;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showKakao, setShowKakao] = useState(false);

  useEffect(() => {
    setShowKakao(
      isMobileShareDevice(
        navigator.userAgent,
        navigator.maxTouchPoints,
        window.__DEARBLOOM_NATIVE_APP__?.platform,
      ),
    );
  }, []);

  const url = () => `${location.origin}${location.pathname}`;
  const notify = (message: string, status: 'success' | 'error') => showToast(message, status);
  const run = async (action: () => Promise<void>, failureMessage: string) => {
    if (loading) return;
    setLoading(true);
    try {
      await action();
    } catch (error) {
      if (!isShareCancelled(error)) notify(failureMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const copyLink = () =>
    run(async () => {
      await copyText(url());
      notify('클립보드에 복사되었습니다', 'success');
      setOpen(false);
    }, '링크를 복사하지 못했어요');

  const shareKakao = () =>
    run(async () => {
      if ((await requestNativeKakaoAvailability()) === false) {
        notify('카카오톡이 설치되어 있지 않아요', 'error');
        return;
      }
      if (!kakaoKey) throw new Error('Kakao key missing');
      const kakao = await loadKakaoSdk();
      if (!kakao.isInitialized()) kakao.init(kakaoKey);
      const shareUrl = url();
      kakao.Share.sendDefault(
        imageUrl
          ? getKakaoFeedShareOptions({
              buttonTitle: '작품 자세히 보기',
              description: '디어블룸에서 졸업스냅 작품을 확인해 보세요.',
              imageUrl,
              title,
              url: shareUrl,
            })
          : {
              objectType: 'text',
              text: `디어블룸에서 ${title} 작품을 확인해 보세요.`,
              link: { mobileWebUrl: shareUrl, webUrl: shareUrl },
            },
      );
    }, '카카오톡 공유를 실행하지 못했어요');

  const shareMore = () =>
    run(async () => {
      const shareUrl = url();
      const text = `디어블룸에서 ${title} 작품을 확인해 보세요.`;
      if (window.__DEARBLOOM_NATIVE_APP__?.platform && window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(
          JSON.stringify({ type: 'NATIVE_SHARE', title, text, url: shareUrl }),
        );
        setOpen(false);
        return;
      }
      if (navigator.share) {
        await navigator.share({ title, text, url: shareUrl });
        setOpen(false);
        return;
      }
      await copyText(shareUrl);
      notify('클립보드에 복사되었습니다', 'success');
      setOpen(false);
    }, '공유 기능을 실행하지 못했어요');

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="공유"
        className="flex h-11 w-11 items-center justify-center text-neutral-800"
      >
        {/* Figma icons/44/Share — 44 컨테이너 안 24px, neutral/n800 */}
        <Share size={24} strokeWidth={1.8} aria-hidden />
      </button>
      <ShareBottomSheet
        open={open}
        onOpenChange={setOpen}
        showKakao={showKakao}
        loading={loading}
        kakaoIconSrc="/images/kakao-talk.png"
        onCopy={copyLink}
        onKakao={shareKakao}
        onMore={shareMore}
      />
    </>
  );
}
