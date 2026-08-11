'use client';

import { useEffect, useState } from 'react';
import { ShareBottomSheet } from '@dearbloom/ui';
import { showCandidateToast } from './CandidateToast';
import { copyText, isMobileShareDevice, isShareCancelled, loadKakaoSdk } from '@/src/lib/webShare';

class ShareError extends Error {}

export function ShareBoardSheet({
  boardId,
  boardName,
  open,
  onOpenChange,
}: {
  boardId: number;
  boardName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [inviteUrl, setInviteUrl] = useState('');
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

  const getInviteUrl = async () => {
    if (inviteUrl) return inviteUrl;
    const response = await fetch(`/app/api/boards/${boardId}/invite-code`);
    if (response.status === 401)
      throw new ShareError('로그인이 만료되었어요. 다시 로그인해 주세요');
    if (response.status === 403) throw new ShareError('이 보드를 공유할 권한이 없어요');
    if (response.status === 404) throw new ShareError('삭제되었거나 존재하지 않는 보드예요');
    if (!response.ok)
      throw new ShareError('초대 링크를 만들지 못했어요. 잠시 후 다시 시도해 주세요');
    const { inviteCode } = (await response.json()) as { inviteCode: string };
    const url = `${window.location.origin}/app/invite/${encodeURIComponent(inviteCode)}`;
    setInviteUrl(url);
    return url;
  };

  const run = async (action: (url: string) => Promise<void> | void, failureMessage: string) => {
    if (loading) return;
    setLoading(true);
    try {
      await action(await getInviteUrl());
    } catch (error) {
      if (isShareCancelled(error)) return;
      showCandidateToast(error instanceof ShareError ? error.message : failureMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const copyLink = () =>
    run(async (url) => {
      await copyText(url);
      showCandidateToast('링크가 복사되었어요', 'success');
      onOpenChange(false);
    }, '링크를 복사하지 못했어요');

  const shareKakao = () =>
    run(async (url) => {
      const key = process.env.NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY;
      if (!key) throw new ShareError('카카오톡 공유를 사용할 수 없어요');
      const kakao = await loadKakaoSdk();
      if (!kakao.isInitialized()) kakao.init(key);
      kakao.Share.sendDefault({
        objectType: 'text',
        text: `${boardName} 공동보드에 초대했어요.`,
        link: { mobileWebUrl: url, webUrl: url },
      });
    }, '카카오톡 공유를 실행하지 못했어요');

  const shareMore = () =>
    run(async (url) => {
      if (window.__DEARBLOOM_NATIVE_APP__?.platform && window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(
          JSON.stringify({
            type: 'NATIVE_SHARE',
            title: boardName,
            text: `${boardName} 공동보드에 초대했어요.`,
            url,
          }),
        );
        onOpenChange(false);
        return;
      }
      if (navigator.share) {
        await navigator.share({
          title: boardName,
          text: `${boardName} 공동보드에 초대했어요.`,
          url,
        });
        onOpenChange(false);
        return;
      }
      await copyText(url);
      showCandidateToast('링크가 복사되었어요', 'success');
    }, '공유 기능을 실행하지 못했어요');

  return (
    <ShareBottomSheet
      open={open}
      onOpenChange={onOpenChange}
      showKakao={showKakao}
      loading={loading}
      kakaoIconSrc="/app/images/kakao-talk.png"
      onCopy={copyLink}
      onKakao={shareKakao}
      onMore={shareMore}
    />
  );
}
