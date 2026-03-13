'use client';

import TaskList from '@/components/TaskList';
import { useTaskStore } from '@/stores/taskStore';

export default function HistoryPage() {
  const tasks = useTaskStore((state) => state.tasks);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <section className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">历史任务</h1>
        <p className="mt-2 text-gray-600">查看并重新打开已提交的翻译配音任务</p>
      </section>

      <TaskList tasks={tasks} onTaskClick={() => {}} />
    </div>
  );
}
