import './globals.css';
import { AppToaster, NativeExitDialog } from '@dearbloom/ui';
import { createNavigationHistoryScript } from '@/src/lib/appNavigation';
import { AppTopNav } from '@/src/components/common/AppTopNav';

export const metadata = { title: 'DearBloom' };

const nativeSafeAreaScript = `
  if (window.__DEARBLOOM_NATIVE_APP__?.platform) {
    document.documentElement.style.setProperty('--dearbloom-safe-area-bottom', '0px');
  }
`;
const navigationHistoryScript = createNavigationHistoryScript();

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <script dangerouslySetInnerHTML={{ __html: nativeSafeAreaScript }} />
        <script dangerouslySetInnerHTML={{ __html: navigationHistoryScript }} />
        {/* font-sans(= Pretendard) 실체. dynamic subset 이라 실제 쓰인 글자만 내려받습니다. */}
        <link rel="preconnect" href="https://cdn.jsdelivr.net" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
      </head>
      <body className="font-sans text-ink">
        {/* PC(lg 이상)에서만 보이는 상단 GNB. 모바일은 각 레이아웃의 하단탭이 맡습니다. */}
        <AppTopNav />
        {children}
        <NativeExitDialog />
        <AppToaster />
      </body>
    </html>
  );
}
