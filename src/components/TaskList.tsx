'use client';

import type { Task } from '@/lib/types';
import TaskItem from './TaskItem';

interface TaskListProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onTaskRetry: (task: Task) => void;
}

export default function TaskList({ tasks, onTaskClick, onTaskRetry }: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <section className="bg-white rounded-xl shadow-md p-8 text-center">
        <div className="text-gray-400">
          <span className="text-4xl">📋</span>
          <p className="mt-4 text-lg">暂无任务记录</p>
          <p className="text-sm">上传视频后，任务将显示在这里</p>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-white rounded-xl shadow-md p-6 md:p-8">
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">
        任务列表 ({tasks.length})
      </h2>

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