'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import UploadSection from '@/components/UploadSection';
import TaskList from '@/components/TaskList';
import ProgressModal from '@/components/ProgressModal';
import { getTaskList } from '@/lib/api';
import type { Task } from '@/lib/types';

type RetryTaskContext = {
  taskId: string;
  lineType?: string;
  voiceTypes?: string[];
  voiceSource?: string;
  duckDb?: number;
  noCache?: boolean;
};

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isTaskListLoading, setIsTaskListLoading] = useState(true);
  const [taskListError, setTaskListError] = useState<string | null>(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [retryTask, setRetryTask] = useState<RetryTaskContext | null>(null);
  const uploadSectionRef = useRef<HTMLDivElement>(null);

  const upsertTask = useCallback((task: Task) => {
    setTasks((currentTasks) => {
      const existingIndex = currentTasks.findIndex((currentTask) => currentTask.task_id === task.task_id);

      if (existingIndex === -1) {
        return [task, ...currentTasks];
      }

      return currentTasks.map((currentTask) =>
        currentTask.task_id === task.task_id ? { ...currentTask, ...task } : currentTask
      );
    });
  }, []);

  const refreshTasks = useCallback(async (fallbackTask?: Task) => {
    setIsTaskListLoading(true);

    try {
      const fetchedTasks = await getTaskList();
      const nextTasks = fallbackTask && !fetchedTasks.some((task) => task.task_id === fallbackTask.task_id)
        ? [fallbackTask, ...fetchedTasks]
        : fetchedTasks;

      setTasks(nextTasks);
      setTaskListError(null);
      setSelectedTask((currentTask) => {
        if (!currentTask) {
          return currentTask;
        }

        return nextTasks.find((task) => task.task_id === currentTask.task_id)
          || (fallbackTask?.task_id === currentTask.task_id ? fallbackTask : currentTask);
      });
    } catch (error) {
      console.error('获取任务列表失败:', error);
      setTaskListError('任务列表刷新失败，请稍后重试');

      if (fallbackTask) {
        upsertTask(fallbackTask);
      }
    } finally {
      setIsTaskListLoading(false);
    }
  }, [upsertTask]);

  useEffect(() => {
    void refreshTasks();
  }, [refreshTasks]);

  // 处理新任务提交
  const handleTaskSubmit = (task: Task) => {
    upsertTask(task);
    setSelectedTask(task);
    setShowTaskModal(true);
    void refreshTasks(task);
  };

  // 处理轮询中的进度更新
  const handleTaskProgress = (task: Task) => {
    upsertTask(task);
    setSelectedTask((prev) =>
      prev && prev.task_id === task.task_id ? task : prev
    );
  };

  // 处理任务完成
  const handleTaskComplete = (task: Task) => {
    upsertTask(task);
    setSelectedTask(task);
    setShowTaskModal(true);
    void refreshTasks(task);
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
      voiceTypes: task.voice_types,
      voiceSource: task.voice_source,
      duckDb: task.duck_db,
      noCache: task.no_cache,
    });
    uploadSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleCancelRetry = () => {
    setRetryTask(null);
  };

  // 关闭模态框
  const handleCloseModal = () => {
    setShowTaskModal(false);
    void refreshTasks(selectedTask || undefined);
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
        isLoading={isTaskListLoading}
        errorMessage={taskListError}
        onRefresh={() => {
          void refreshTasks(selectedTask || undefined);
        }}
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