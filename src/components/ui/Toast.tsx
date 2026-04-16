'use client';

import { useEffect } from 'react';
import { createPortal } from 'react-dom';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
  message: string;
  type: ToastType;
  duration?: number;
  onClose: () => void;
}

const typeConfig = {
  success: { bg: 'bg-green-500', icon: '✅' },
  error: { bg: 'bg-red-500', icon: '❌' },
  info: { bg: 'bg-blue-500', icon: 'ℹ️' },
  warning: { bg: 'bg-yellow-500', icon: '⚠️' },
};

function Toast({ message, type, duration = 3000, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const config = typeConfig[type];

  return (
    <div
      className={`
        ${config.bg} text-white px-4 py-3 rounded-lg shadow-lg
        flex items-center space-x-3 animate-in slide-in-from-right
      `}
    >
      <span>{config.icon}</span>
      <span className="flex-1">{message}</span>
      <button onClick={onClose} aria-label="关闭提示" className="hover:opacity-80">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

// Toast 管理器
let toastContainer: HTMLDivElement | null = null;

export function showToast(message: string, type: ToastType = 'info', duration?: number) {
  if (typeof window === 'undefined') return;

  if (!toastContainer) {
    const existingContainer = document.getElementById('toast-container');
    if (existingContainer instanceof HTMLDivElement) {
      // 复用 layout 中已有的容器
      toastContainer = existingContainer;
    } else {
      toastContainer = document.createElement('div');
      toastContainer.id = 'toast-container';
      toastContainer.className = 'fixed top-4 right-4 z-[1000] space-y-2';
      document.body.appendChild(toastContainer);
    }
  }

  // 保障层级始终高于 Modal（Modal 当前为 z-50）。
  toastContainer.classList.add('z-[1000]');
  toastContainer.style.zIndex = '1000';

  const toast = document.createElement('div');
  toastContainer.appendChild(toast);

  let rootRef: { unmount: () => void } | null = null;
  const removeToast = () => {
    rootRef?.unmount();
    toast.remove();
  };

  // 使用 React 渲染
  import('react-dom/client').then(({ createRoot }) => {
    const root = createRoot(toast);
    rootRef = root;
    root.render(<Toast message={message} type={type} duration={duration} onClose={removeToast} />);
  });
}

export default Toast;