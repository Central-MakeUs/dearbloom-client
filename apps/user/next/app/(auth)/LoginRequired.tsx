import { Button, cn } from '@dearbloom/ui';

import { loginHref } from '@/src/lib/env';

interface LoginRequiredProps {
  title?: string;
  /** 이 화면에서 로그인이 왜 필요한지 한 줄로. */
  description?: string;
  /** 로그인 후 돌아올 경로(브라우저 기준이라 next 앱 안이면 '/app' 접두어 포함). */
  returnUrl?: string;
  className?: string;
}

/**
 * 비로그인 상태에서 화면 본문 대신 보여주는 로그인 유도 블록.
 *
 * 예전에는 화면마다 문구·버튼 모양이 제각각이었고 채팅·마이 탭만 바텀시트를 자동으로 올렸다.
 * 지금은 어디서든 같은 안내를 보여주고, 버튼을 눌러야 소셜 로그인 화면으로 이동한다(디자인 확정).
 *
 * 뒤로가기: 로그인 화면은 push 로 얹혀서 닫기(X)=뒤로가기로 이 화면에 돌아온다.
 * 로그인 엔트리는 SocialLoginButtons 의 replace 이동으로 사라지므로, 로그인 후 뒤로가기가
 * 로그인 화면에 막혀 다시 앞으로 튕기는 일이 없다.
 */
export function LoginRequired({
  title = '로그인이 필요해요',
  description = '로그인하고 모든 기능을 이용해 보세요.',
  returnUrl,
  className,
}: LoginRequiredProps) {
  return (
    <div className={cn('flex flex-col items-center px-6 py-[120px] text-center', className)}>
      <h2 className="text-head-3 text-neutral-950">{title}</h2>
      <p className="mt-2 text-body-6 text-neutral-600">{description}</p>
      <Button asChild className="mt-4">
        <a href={loginHref(returnUrl)}>로그인 하기</a>
      </Button>
    </div>
  );
}
