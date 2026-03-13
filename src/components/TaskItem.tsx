'use client';

import type { Task } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';

interface TaskItemProps {
  task: Task;
  onClick: () => void;
}

const statusConfig = {
  pending: { color: 'bg-gray-100 text-gray-600', label: '等待中' },
  processing: { color: 'bg-blue-100 text-blue-600', label: '处理中' },
  success: { color: 'bg-green-100 text-green-600', label: '已完成' },
  failed: { color: 'bg-red-100 text-red-600', label: '失败' },
  unknown: { color: 'bg-gray-100 text-gray-600', label: '未知' },
};

export default function TaskItem({ task, onClick }: TaskItemProps) {
  const status = statusConfig[task.status] || statusConfig.unknown;
  const timeAgo = formatDistanceToNow(new Date(task.created_at), {
    addSuffix: true,
    locale: zhCN,
  });

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center justify-between p-4 border border-gray-200 
                 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors w-full text-left"
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-3">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
            {status.label}
          </span>
          <span className="text-sm text-gray-500">{timeAgo}</span>
        </div>
        
        <p className="mt-2 text-gray-900 font-medium truncate">
          {task.source_file_name || '未命名任务'}
        </p>
        
        {/* 进度条 */}
        <div className="mt-2">
          <div className="flex items-center justify-between text-sm text-gray-500 mb-1">
            <span>{task.current_step || '等待开始'}</span>
            <span>{task.progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${
                task.status === 'failed' 
                  ? 'bg-red-500' 
                  : task.status === 'success'
                  ? 'bg-green-500'
                  : 'bg-primary-600'
              }`}
              style={{ width: `${task.progress}%` }}
            />
          </div>
        </div>
      </div>

      <div className="ml-4 flex-shrink-0">
        <svg
          className="w-5 h-5 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </div>
    </button>
  );
}