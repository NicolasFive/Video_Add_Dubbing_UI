'use client';

import { useState } from 'react';
import UploadSection from '@/components/UploadSection';
import TaskList from '@/components/TaskList';
import ProgressModal from '@/components/ProgressModal';
import ResultModal from '@/components/ResultModal';
import { useTaskStore } from '@/stores/taskStore';
import type { Task } from '@/lib/types';

export default function Home() {
  const { tasks, addTask, updateTask } = useTaskStore();
  const [showProgress, setShowProgress] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // 处理新任务提交
  const handleTaskSubmit = (task: Task) => {
    addTask(task);
    setSelectedTask(task);
    setShowProgress(true);
  };

  // 处理任务完成
  const handleTaskComplete = (task: Task) => {
    updateTask(task);
    setShowProgress(false);
    setShowResult(true);
  };

  // 处理任务列表点击
  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    if (task.status === 'success') {
      setShowResult(true);
    } else if (task.status === 'processing' || task.status === 'pending' || task.status === 'failed') {
      setShowProgress(true);
    }
  };

  // 关闭模态框
  const handleCloseModal = () => {
    setShowProgress(false);
    setShowResult(false);
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
      <UploadSection onTaskSubmit={handleTaskSubmit} />

      {/* 任务列表 */}
      <TaskList 
        tasks={tasks} 
        onTaskClick={handleTaskClick}
      />

      {/* 进度模态框 */}
      {showProgress && selectedTask && (
        <ProgressModal
          task={selectedTask}
          onComplete={handleTaskComplete}
          onClose={handleCloseModal}
        />
      )}

      {/* 结果模态框 */}
      {showResult && selectedTask && (
        <ResultModal
          task={selectedTask}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}