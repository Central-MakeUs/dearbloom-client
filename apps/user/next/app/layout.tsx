import './globals.css';
import { Toaster } from 'sonner';

export const metadata = { title: 'dearBloom' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="font-sans text-ink">
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
