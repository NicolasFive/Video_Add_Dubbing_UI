import { useState, useEffect, useCallback, useRef } from 'react';
import { getTaskStatus, getTaskResult } from '@/lib/api';
import type { StatusResponse, ResultResponse } from '@/lib/types';

interface UseTaskPollingOptions {
  taskId: string | null;
  pollingInterval?: number;
  maxPollingTime?: number;
  onProgress?: (status: StatusResponse) => void;
  onComplete?: (result: ResultResponse) => void;
  onError?: (error: Error) => void;
}

interface UseTaskPollingReturn {
  isPolling: boolean;
  progress: number;
  currentStep: string | null;
  status: string;
  startPolling: () => void;
  stopPolling: () => void;
  error: Error | null;
}

const DEFAULT_POLLING_INTERVAL = 2000;
const DEFAULT_MAX_POLLING_TIME = 3600000; // 1小时

export function useTaskPolling({
  taskId,
  pollingInterval = DEFAULT_POLLING_INTERVAL,
  maxPollingTime = DEFAULT_MAX_POLLING_TIME,
  onProgress,
  onComplete,
  onError,
}: UseTaskPollingOptions): UseTaskPollingReturn {
  const [isPolling, setIsPolling] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState<string | null>(null);
  const [status, setStatus] = useState('pending');
  const [error, setError] = useState<Error | null>(null);
  
  const pollingRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startTimeRef = useRef<number>(0);
  const pollingInitiatedRef = useRef<string | null>(null);

  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      clearTimeout(pollingRef.current);
      pollingRef.current = null;
    }
    setIsPolling(false);
  }, []);

  const pollTask = useCallback(async () => {
    if (!taskId) return;

    try {
      // 检查是否超时
      const elapsed = Date.now() - startTimeRef.current;
      if (elapsed > maxPollingTime) {
        throw new Error('任务处理超时');
      }

      // 获取任务状态
      const statusData = await getTaskStatus(taskId);
      
      setProgress(statusData.progress);
      setCurrentStep(statusData.current_step);
      setStatus(statusData.status);

      // 触发进度回调
      onProgress?.(statusData);

      // 检查任务是否完成
      if (statusData.status === 'success') {
        // 获取完整结果
        const resultData = await getTaskResult(taskId);
        onComplete?.(resultData);
        stopPolling();
        return;
      }

      // 检查任务是否失败
      if (statusData.status === 'failed') {
        throw new Error(statusData.error_detail || '任务处理失败');
      }

      // 继续轮询
      if (statusData.status === 'processing' || statusData.status === 'pending') {
        pollingRef.current = setTimeout(pollTask, pollingInterval);
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('未知错误');
      setError(error);
      onError?.(error);
      stopPolling();
    }
  }, [taskId, pollingInterval, maxPollingTime, onProgress, onComplete, onError, stopPolling]);

  const startPolling = useCallback(() => {
    if (!taskId || isPolling) return;
    
    startTimeRef.current = Date.now();
    setIsPolling(true);
    setError(null);
    pollTask();
  }, [taskId, isPolling, pollTask]);

  // 清理
  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, [stopPolling]);

  // 当taskId变化时重新开始（只启动一次，避免因 isPolling 变化反复重启）
  useEffect(() => {
    if (taskId && pollingInitiatedRef.current !== taskId) {
      pollingInitiatedRef.current = taskId;
      startPolling();
    }
  }, [taskId, startPolling]);

  return {
    isPolling,
    progress,
    currentStep,
    status,
    startPolling,
    stopPolling,
    error,
  };
}