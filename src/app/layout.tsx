import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '수학몬스터 오일러 | 중1 수학 2학기 RPG & PVP',
  description: '중학교 1학년 2학기 수학(기본도형, 작도와 합동, 평면도형, 입체도형, 통계)을 레트로 RPG 배틀과 교실 1:1 실시간 통신대전으로 공부하자! 100% 오리지널 교육용 비영리 웹게임.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="min-h-screen bg-slate-950 flex flex-col items-center justify-center">
        {children}
      </body>
    </html>
  );
}
