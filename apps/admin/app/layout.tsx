import './globals.css';

export const metadata = { title: 'dearBloom Admin' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="font-sans text-ink p-10">{children}</body>
    </html>
  );
}
