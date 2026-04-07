'use client';

import type { Task } from '@/lib/types';
import TaskItem from './TaskItem';

interface TaskListProps {
  tasks: Task[];
  isLoading?: boolean;
  errorMessage?: string | null;
  onRefresh?: () => void;
  onTaskClick: (task: Task) => void;
  onTaskRetry: (task: Task) => void;
}

export default function TaskList({
  tasks,
  isLoading = false,
  errorMessage = null,
  onRefresh,
  onTaskClick,
  onTaskRetry,
}: TaskListProps) {
  if (isLoading && tasks.length === 0) {
    return (
      <section className="bg-white rounded-xl shadow-md p-8 text-center">
        <div className="text-gray-400">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-gray-200 border-t-primary-600" />
          <p className="mt-4 text-lg">正在加载任务列表</p>
          <p className="text-sm">请稍候...</p>
        </div>
      </section>
    );
  }

  if (tasks.length === 0) {
    return (
      <section className="bg-white rounded-xl shadow-md p-8 text-center">
        <div className="text-gray-400">
          <span className="text-4xl">📋</span>
          <p className="mt-4 text-lg">暂无任务记录</p>
          <p className="text-sm">上传视频后，任务将显示在这里</p>
          {errorMessage && <p className="mt-3 text-sm text-red-500">{errorMessage}</p>}
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              className="mt-4 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:border-primary-300 hover:text-primary-600"
            >
              重新加载
            </button>
          )}
        </div>
      </section>
    );
  }

  return (
    <section className="bg-white rounded-xl shadow-md p-6 md:p-8">
      <div className="mb-6 flex items-center justify-between gap-3">
        <h2 className="text-2xl font-semibold text-gray-900">
          任务列表 ({tasks.length})
        </h2>
        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:border-primary-300 hover:text-primary-600"
          >
            刷新
          </button>
        )}
      </div>

      {errorMessage && (
        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          {errorMessage}
        </div>
      )}

      <div className="space-y-4">
        {tasks.map((task) => (
          <TaskItem
            key={task.task_id}
            task={task}
            onClick={() => onTaskClick(task)}
            onRetry={() => onTaskRetry(task)}
          />
        ))}
      </div>
    </section>
  );
}