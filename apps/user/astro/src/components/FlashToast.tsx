import { useEffect } from 'react';
import { toast } from 'sonner';
import { ToastMessage } from '@dearbloom/ui';

const messages = {
  login: '다시 만나서 반가워요!',
  logout: '로그아웃되었어요.',
  welcome: '디어블룸에 오신 것을 환영해요!',
  withdrawal: '회원 탈퇴가 완료되었어요.',
} as const;

export function FlashToast() {
  useEffect(() => {
    const url = new URL(window.location.href);
    const kind = url.searchParams.get('_toast') as keyof typeof messages | null;
    if (!kind || !messages[kind]) return;

    toast.custom(
      () => (
        <div className="flex w-full justify-center">
          <ToastMessage iconBasePath="/images" message={messages[kind]} status="success" />
        </div>
      ),
      {
        className: 'candidate-toast candidate-toast-success',
        duration: 2500,
        id: `flash-${kind}`,
        position: 'bottom-center',
      },
    );
    url.searchParams.delete('_toast');
    window.history.replaceState(window.history.state, '', url);
  }, []);

  return null;
}
