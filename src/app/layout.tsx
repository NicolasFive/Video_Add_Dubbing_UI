import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Header from '@/components/Header';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: '听译加 - 视频翻译配音工具',
  description: '上传视频，自动翻译成中文并添加配音和字幕',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className={`${inter.className} bg-gray-50 min-h-screen`}>
        <Header />
        <main className="container mx-auto px-4 py-8">
          {children}
        </main>
        {/* 全局Toast容器 */}
        <div id="toast-container" className="fixed top-4 right-4 z-[1000] space-y-2" />
      </body>
    </html>
  );
}