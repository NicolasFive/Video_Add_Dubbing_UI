'use client';

import { useTaskPolling } from '@/hooks/useTaskPolling';
import type { Task } from '@/lib/types';
import Modal from './ui/Modal';
import ProgressBar from './ui/ProgressBar';
import Button from './ui/Button';

interface ProgressModalProps {
  task: Task;
  onComplete: (task: Task) => void;
  onClose: () => void;
}

export default function ProgressModal({ task, onComplete, onClose }: ProgressModalProps) {
  const {
    isPolling,
    progress,
    currentStep,
    status,
    error,
    stopPolling,
  } = useTaskPolling({
    taskId: task.task_id,
    onProgress: () => {},
    onComplete: async (resultData) => {
      // 任务完成，更新任务信息
      const updatedTask: Task = {
        ...task,
        status: resultData.status,
        progress: resultData.progress,
        current_step: resultData.current_step,
        files: resultData.files,
        updated_at: new Date().toISOString(),
      };
      onComplete(updatedTask);
    },
    onError: (err) => {
      console.error('轮询错误:', err);
    },
  });

  // 状态映射
  const statusText = {
    pending: '等待处理',
    processing: '处理中',
    success: '处理完成',
    failed: '处理失败',
    unknown: '未知状态',
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="任务处理进度"
      size="md"
    >
      <div className="space-y-6">
        {/* 任务信息 */}
        <div className="text-center">
          <p className="text-sm text-gray-500">任务ID</p>
          <p className="font-mono text-xs text-gray-400 break-all">
            {task.task_id}
          </p>
        </div>

        {/* 进度条 */}
        <ProgressBar
          progress={progress}
          status={status}
          currentStep={currentStep}
        />

        {/* 状态文本 */}
        <div className="text-center">
          <p className={`text-lg font-medium ${
            status === 'failed' ? 'text-red-600' :
            status === 'success' ? 'text-green-600' :
            'text-primary-600'
          }`}>
            {error ? error.message : statusText[status as keyof typeof statusText]}
          </p>
          {currentStep && (
            <p className="text-sm text-gray-500 mt-1">
              当前步骤：{currentStep}
            </p>
          )}
        </div>

        {/* 错误信息 */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error.message}</p>
          </div>
        )}

        {/* 操作按钮 */}
        <div className="flex justify-center space-x-4 pt-4">
          {status === 'failed' && (
            <Button variant="secondary" onClick={onClose}>
              关闭
            </Button>
          )}
          {status === 'success' && (
            <Button onClick={onClose}>
              查看结果
            </Button>
          )}
          {isPolling && (
            <Button variant="secondary" onClick={stopPolling}>
              停止轮询
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}