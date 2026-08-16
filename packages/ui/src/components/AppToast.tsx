'use client';

import { useEffect } from 'react';
import { toast, Toaster } from 'sonner';
import { ToastMessage } from './ToastMessage';

export type AppToastStatus = 'error' | 'success';

const flashMessages = {
  login: '다시 만나서 반가워요!',
  logout: '로그아웃되었어요.',
  profile: '프로필이 수정되었습니다',
  welcome: '디어블룸에 오신 것을 환영해요!',
  withdrawal: '회원 탈퇴가 완료되었어요.',
} as const;

function getIconBasePath() {
  return window.location.pathname.startsWith('/app') ? '/app/images' : '/images';
}

export function showToast(message: string, status: AppToastStatus = 'success') {
  return toast.custom(
    () => (
      <div className="flex w-full justify-center">
        <ToastMessage iconBasePath={getIconBasePath()} message={message} status={status} />
      </div>
    ),
    {
      className: `app-toast app-toast-${status}`,
      duration: 2500,
      id: `${status}:${message}`,
      position: 'bottom-center',
    },
  );
}

export function FlashToast() {
  useEffect(() => {
    const url = new URL(window.location.href);
    const kind = url.searchParams.get('_toast') as keyof typeof flashMessages | null;
    if (!kind || !flashMessages[kind]) return;

    showToast(flashMessages[kind]);
    url.searchParams.delete('_toast');
    window.history.replaceState(window.history.state, '', url);
  }, []);

  return null;
}

export function AppToaster() {
  return (
    <>
      <Toaster position="top-center" richColors />
      <style>{`
        .app-toast {
          left: 0 !important;
          right: 0 !important;
          margin-inline: auto !important;
          width: 356px !important;
        }

        .app-toast-error { margin-bottom: 44px; }
        .app-toast-success { margin-bottom: 60px; }

        @media (max-width: 600px) {
          .app-toast {
            left: -16px !important;
            right: 16px !important;
            width: min(calc(100vw - 32px), 400px) !important;
          }

          .app-toast-error { margin-bottom: 52px; }
          .app-toast-success { margin-bottom: 68px; }
        }
      `}</style>
    </>
  );
}
