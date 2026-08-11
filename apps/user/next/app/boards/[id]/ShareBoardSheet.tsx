'use client';

import { useEffect, useState } from 'react';
import { Link, MoreHorizontal, X } from 'lucide-react';
import { BottomSheet, Button } from '@dearbloom/ui';
import { showCandidateToast } from './CandidateToast';
import { isMobileShareDevice, isShareCancelled } from '@/src/lib/webShare';

interface KakaoSdk {
  init: (key: string) => void;
  isInitialized: () => boolean;
  Share: {
    sendDefault: (options: {
      objectType: 'text';
      text: string;
      link: { mobileWebUrl: string; webUrl: string };
    }) => void;
  };
}

declare global {
  interface Window {
    Kakao?: KakaoSdk;
  }
}

let kakaoSdkPromise: Promise<KakaoSdk> | undefined;

class ShareError extends Error {}

function loadKakaoSdk() {
  if (window.Kakao) return Promise.resolve(window.Kakao);
  if (kakaoSdkPromise) return kakaoSdkPromise;

  kakaoSdkPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://t1.kakaocdn.net/kakao_js_sdk/2.7.4/kakao.min.js';
    script.crossOrigin = 'anonymous';
    script.onload = () => window.Kakao ? resolve(window.Kakao) : reject(new Error('Kakao SDK load failed'));
    script.onerror = () => reject(new Error('Kakao SDK load failed'));
    document.head.appendChild(script);
  });

  return kakaoSdkPromise;
}

async function copyText(text: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand('copy');
  textarea.remove();
}

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
    setShowKakao(isMobileShareDevice(
      navigator.userAgent,
      navigator.maxTouchPoints,
      window.__DEARBLOOM_NATIVE_APP__?.platform,
    ));
  }, []);

  const getInviteUrl = async () => {
    if (inviteUrl) return inviteUrl;
    const response = await fetch(`/app/api/boards/${boardId}/invite-code`);
    if (response.status === 401) throw new ShareError('로그인이 만료되었어요. 다시 로그인해 주세요');
    if (response.status === 403) throw new ShareError('이 보드를 공유할 권한이 없어요');
    if (response.status === 404) throw new ShareError('삭제되었거나 존재하지 않는 보드예요');
    if (!response.ok) throw new ShareError('초대 링크를 만들지 못했어요. 잠시 후 다시 시도해 주세요');
    const { inviteCode } = (await response.json()) as { inviteCode: string };
    const url = `${window.location.origin}/app/invite/${encodeURIComponent(inviteCode)}`;
    setInviteUrl(url);
    return url;
  };

  const run = async (
    action: (url: string) => Promise<void> | void,
    failureMessage: string,
  ) => {
    if (loading) return;
    setLoading(true);
    try {
      await action(await getInviteUrl());
    } catch (error) {
      if (isShareCancelled(error)) return;
      showCandidateToast(
        error instanceof ShareError ? error.message : failureMessage,
        'error',
      );
    } finally {
      setLoading(false);
    }
  };

  const copyLink = () => run(async (url) => {
    await copyText(url);
    showCandidateToast('링크가 복사되었어요', 'success');
    onOpenChange(false);
  }, '링크를 복사하지 못했어요');

  const shareKakao = () => run(async (url) => {
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

  const shareMore = () => run(async (url) => {
    if (window.__DEARBLOOM_NATIVE_APP__?.platform && window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(JSON.stringify({
        type: 'NATIVE_SHARE',
        title: boardName,
        text: `${boardName} 공동보드에 초대했어요.`,
        url,
      }));
      onOpenChange(false);
      return;
    }
    if (navigator.share) {
      await navigator.share({ title: boardName, text: `${boardName} 공동보드에 초대했어요.`, url });
      onOpenChange(false);
      return;
    }
    await copyText(url);
    showCandidateToast('링크가 복사되었어요', 'success');
  }, '공유 기능을 실행하지 못했어요');

  const optionClass = 'flex w-20 flex-col items-center gap-2 rounded-xl px-3 py-2 text-body-5 text-neutral-950 disabled:opacity-40';

  const options = (
    <div className="flex h-[143px] items-start justify-center gap-4 pt-3.5">
      <button type="button" className={optionClass} onClick={copyLink} disabled={loading}>
        <span className="flex size-14 items-center justify-center rounded-full bg-primary text-neutral-0">
          <Link className="size-8" strokeWidth={2} aria-hidden />
        </span>
        <span>링크복사</span>
      </button>
      {showKakao ? (
        <button type="button" className={optionClass} onClick={shareKakao} disabled={loading}>
          <img src="/app/images/kakao-talk.png" alt="" className="size-14 rounded-full" />
          <span>카카오톡</span>
        </button>
      ) : null}
      <button type="button" className={optionClass} onClick={shareMore} disabled={loading}>
        <span className="flex size-14 items-center justify-center rounded-full bg-neutral-400 text-neutral-0">
          <MoreHorizontal className="size-8" strokeWidth={2.5} aria-hidden />
        </span>
        <span>더보기</span>
      </button>
    </div>
  );

  const header = (
    <div className="flex h-16 items-center justify-between border-b border-neutral-200 px-5">
      <h2 className="text-head-3 text-neutral-950">공유하기</h2>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => onOpenChange(false)}
        aria-label="닫기"
        className="size-10 rounded-full bg-neutral-200 text-neutral-600 hover:bg-neutral-300"
      >
        <X className="size-[26px]" strokeWidth={1.5} />
      </Button>
    </div>
  );

  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      title="공유하기"
      className="pb-0"
      showHandle={false}
    >
      {header}
      {options}
    </BottomSheet>
  );
}
