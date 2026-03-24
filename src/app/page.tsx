'use client';

import { useRef, useState } from 'react';
import UploadSection from '@/components/UploadSection';
import TaskList from '@/components/TaskList';
import ProgressModal from '@/components/ProgressModal';
import { useTaskStore } from '@/stores/taskStore';
import type { Task } from '@/lib/types';

type RetryTaskContext = {
  taskId: string;
  lineType?: string;
};

export default function Home() {
  const { tasks, addTask, updateTask } = useTaskStore();
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [retryTask, setRetryTask] = useState<RetryTaskContext | null>(null);
  const uploadSectionRef = useRef<HTMLDivElement>(null);

  // 处理新任务提交
  const handleTaskSubmit = (task: Task) => {
    const isRetryTask = Boolean(retryTask);
    if (isRetryTask) {
      updateTask(task);
    } else {
      addTask(task);
    }

    setSelectedTask(task);
    setShowTaskModal(true);
  };

  // 处理轮询中的进度更新
  const handleTaskProgress = (task: Task) => {
    updateTask(task);
    setSelectedTask((prev) =>
      prev && prev.task_id === task.task_id ? task : prev
    );
  };

  // 处理任务完成
  const handleTaskComplete = (task: Task) => {
    updateTask(task);
    setSelectedTask(task);
    setShowTaskModal(true);
  };

  // 处理任务列表点击
  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setShowTaskModal(true);
  };

  const handleTaskRetry = (task: Task) => {
    setRetryTask({
      taskId: task.task_id,
      lineType: task.line_type,
    });
    uploadSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleCancelRetry = () => {
    setRetryTask(null);
  };

  // 关闭模态框
  const handleCloseModal = () => {
    setShowTaskModal(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* 页面标题 */}
      <section className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          🎬 听译加
        </h1>
        <p className="text-gray-600 text-lg">
          上传视频，自动翻译成中文并添加配音和字幕
        </p>
      </section>

      {/* 上传区域 */}
      <div ref={uploadSectionRef}>
        <UploadSection
          onTaskSubmit={handleTaskSubmit}
          retryTask={retryTask}
          onCancelRetry={handleCancelRetry}
        />
      </div>

      {/* 任务列表 */}
      <TaskList 
        tasks={tasks} 
        onTaskClick={handleTaskClick}
        onTaskRetry={handleTaskRetry}
      />

      {/* 进度模态框 */}
      {showTaskModal && selectedTask && (
        <ProgressModal
          task={selectedTask}
          onProgress={handleTaskProgress}
          onComplete={handleTaskComplete}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}