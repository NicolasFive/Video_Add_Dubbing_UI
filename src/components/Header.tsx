'use client';

import Link from 'next/link';

export default function Header() {
  return (
    <header className="bg-white shadow-sm sticky top-0 z-40">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl">🎬</span>
            <span className="text-xl font-bold text-gray-900">听译加</span>
          </Link>

          {/* 导航链接 */}
          <nav className="flex items-center space-x-6">
            <Link 
              href="/" 
              className="text-gray-600 hover:text-primary-600 transition-colors"
            >
              首页
            </Link>
            <Link 
              href="/history" 
              className="text-gray-600 hover:text-primary-600 transition-colors"
            >
              历史记录
            </Link>
            <a 
              href="https://github.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-primary-600 transition-colors"
            >
              帮助
            </a>
          </nav>
        </div>
      </div>
    </header>
  );
}