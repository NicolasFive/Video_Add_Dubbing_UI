'use client';

import { useEffect, useRef, useState } from 'react';
import { useTaskPolling } from '@/hooks/useTaskPolling';
import { downloadFile, getOptimizeData, getSelfCheckData, getTaskResult, submitCheckConfirm, updateOptimizeData } from '@/lib/api';
import type { Task, ResultFile, SelfCheckItem } from '@/lib/types';
import Modal from './ui/Modal';
import ProgressBar from './ui/ProgressBar';
import Button from './ui/Button';
import { showToast } from './ui/Toast';
import { formatDateTime, formatFileSize } from '@/lib/utils';

interface ProgressModalProps {
  task: Task;
  onProgress: (task: Task) => void;
  onComplete: (task: Task) => void;
  onClose: () => void;
}

const STAGE_OPTIONS = [
  { value: 'Translating', label: '翻译' },
  { value: 'Building Subtitles', label: '生成字幕数据' },
  { value: 'Optimizing Subtitles', label: '优化字幕数据' },
  { value: 'Generating Subtitles', label: '生成字幕' },
  { value: 'Mark Delete Segment', label: '标记删除片段' },
] as const;

export default function ProgressModal({ task, onProgress, onComplete, onClose }: ProgressModalProps) {
  const [files, setFiles] = useState<ResultFile[]>([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [downloadingFile, setDownloadingFile] = useState<string | null>(null);
  const [selectedStage, setSelectedStage] = useState<string>('');
  const [stageData, setStageData] = useState<string>('');
  const [showStageData, setShowStageData] = useState(false);
  const [selfCheckItems, setSelfCheckItems] = useState<SelfCheckItem[]>([]);
  const [showSelfCheckData, setShowSelfCheckData] = useState(false);
  const [isQueryingStage, setIsQueryingStage] = useState(false);
  const [isUpdatingStage, setIsUpdatingStage] = useState(false);
  const [isCheckingStage, setIsCheckingStage] = useState(false);
  const [isSubmittingCheck, setIsSubmittingCheck] = useState(false);
  const taskRef = useRef(task);
  const onProgressRef = useRef(onProgress);

  useEffect(() => {
    taskRef.current = task;
  }, [task]);

  useEffect(() => {
    onProgressRef.current = onProgress;
  }, [onProgress]);

  const {
    isPolling,
    progress,
    currentStep,
    status,
    error,
    stopPolling,
  } = useTaskPolling({
    taskId: task.task_id,
    onProgress: (statusData) => {
      onProgress({
        ...task,
        status: statusData.status,
        progress: statusData.progress,
        current_step: statusData.current_step,
        error_detail: statusData.error_detail,
        video_url: statusData.video_url,
        subtitle_url: statusData.subtitle_url,
        updated_at: new Date().toISOString(),
      });
    },
    onComplete: async (statusData) => {
      // 任务完成，更新任务信息
      const updatedTask: Task = {
        ...task,
        status: statusData.status,
        progress: statusData.progress,
        current_step: statusData.current_step,
        updated_at: new Date().toISOString(),
      };
      onComplete(updatedTask);
    },
    onError: (err, latestStatus) => {
      // 任务出错，更新任务信息
      const updatedTask: Task = {
        ...task,
        status: latestStatus?.status || 'failed',
        progress: latestStatus?.progress ?? task.progress,
        current_step: latestStatus?.current_step ?? task.current_step,
        error_detail: latestStatus?.error_detail || (err instanceof Error ? err.message : '未知错误'),
        video_url: latestStatus?.video_url ?? task.video_url,
        subtitle_url: latestStatus?.subtitle_url ?? task.subtitle_url,
        updated_at: new Date().toISOString(),
      };
      onComplete(updatedTask);
    },
  });

  const displayStatus = isPolling ? status : task.status;
  const displayProgress = isPolling ? progress : task.progress;
  const displayStep = isPolling ? currentStep : task.current_step;

  useEffect(() => {
    const fetchResult = async () => {
      setIsLoadingFiles(true);
      try {
        const currentTask = taskRef.current;
        const result = await getTaskResult(currentTask.task_id);
        const updatedTask: Task = {
          ...currentTask,
          status: result.status,
          progress: result.progress,
          current_step: result.current_step,
          updated_at: new Date().toISOString(),
        };
        setFiles(result.files || []);
        onProgressRef.current(updatedTask);
      } catch (fetchError) {
        console.error('获取结果失败:', fetchError);
        showToast('获取结果失败', 'error');
      } finally {
        setIsLoadingFiles(false);
      }
    };

    fetchResult();
  }, [task.task_id]);

  const handleDownload = async (file: ResultFile) => {
    setDownloadingFile(file.file_name);
    try {
      const blob = await downloadFile(task.task_id, file.relative_path);

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.file_name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      showToast('下载成功', 'success');
    } catch (downloadError) {
      console.error('下载失败:', downloadError);
      showToast('下载失败，请重试', 'error');
    } finally {
      setDownloadingFile(null);
    }
  };

  const handleQueryStageData = async () => {
    if (!selectedStage) {
      showToast('请先选择流程节点', 'error');
      return;
    }

    setIsQueryingStage(true);
    try {
      const result = await getOptimizeData(task.task_id, selectedStage);
      setStageData(result.data || '');
      setShowStageData(true);
      setShowSelfCheckData(false);
      showToast('查询成功', 'success');
    } catch (queryError) {
      console.error('查询流程节点数据失败:', queryError);
      showToast('查询失败，请重试', 'error');
    } finally {
      setIsQueryingStage(false);
    }
  };

  const handleUpdateStageData = async () => {
    if (!selectedStage) {
      showToast('请先选择流程节点', 'error');
      return;
    }

    if (!stageData.trim()) {
      showToast('data 不能为空', 'error');
      return;
    }

    setIsUpdatingStage(true);
    try {
      await updateOptimizeData(task.task_id, selectedStage, stageData);
      showToast('更新成功', 'success');
      setShowStageData(false);
      setStageData('');
    } catch (updateError) {
      console.error('更新流程节点数据失败:', updateError);
      showToast('更新失败，请重试', 'error');
    } finally {
      setIsUpdatingStage(false);
    }
  };

  const handleSelfCheck = async () => {
    if (!selectedStage) {
      showToast('请先选择流程节点', 'error');
      return;
    }

    setIsCheckingStage(true);
    try {
      const result = await getSelfCheckData(task.task_id, selectedStage);
      setSelfCheckItems(result.data || []);
      setShowSelfCheckData(true);
      setShowStageData(false);
      showToast('智能自检完成', 'success');
    } catch (checkError) {
      console.error('智能自检失败:', checkError);
      showToast('智能自检失败，请重试', 'error');
    } finally {
      setIsCheckingStage(false);
    }
  };

  const handleConfirmContentChange = (index: number, value: string) => {
    setSelfCheckItems((currentItems) =>
      currentItems.map((item) =>
        item.index === index
          ? {
              ...item,
              confirm_content: value,
            }
          : item
      )
    );
  };

  const handleSubmitSelfCheck = async () => {
    if (!selectedStage) {
      showToast('请先选择流程节点', 'error');
      return;
    }

    setIsSubmittingCheck(true);
    try {
      await submitCheckConfirm(task.task_id, selectedStage, selfCheckItems);
      showToast('提交成功', 'success');
      setShowSelfCheckData(false);
      handleSelfCheck();
    } catch (submitError) {
      console.error('提交自检确认失败:', submitError);
      showToast('提交失败，请重试', 'error');
    } finally {
      setIsSubmittingCheck(false);
    }
  };

  // 状态映射
  const statusText: Record<string, string> = {
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
      title="任务处理详情"
      size="lg"
    >
      <div className="space-y-6">
        {/* 任务信息 */}
        <div className="text-left">
          <p className="text-sm text-gray-500">任务ID</p>
          <p className="font-mono text-xs text-gray-400 break-all">{task.task_id}</p>
        </div>

        {/* 进度条 */}
        <ProgressBar
          progress={displayProgress}
          status={displayStatus}
          currentStep={`当前步骤：${displayStep}`}
        />

        {/* 错误信息 */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error.message}</p>
          </div>
        )}

        {/* 流程节点查询与更新 */}
        <div className="p-4 border border-gray-200 rounded-lg space-y-4">
          <p className="text-sm text-gray-500">流程节点</p>
          <div className="flex flex-col sm:flex-row gap-3">
            <select
              className="w-full sm:flex-1 px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={selectedStage}
              onChange={(e) => {
                setSelectedStage(e.target.value);
                setShowStageData(false);
                setStageData('');
                setShowSelfCheckData(false);
                setSelfCheckItems([]);
              }}
            >
              <option value="">请选择流程节点</option>
              {STAGE_OPTIONS.map((stage) => (
                <option key={stage.value} value={stage.value}>
                  {stage.label}
                </option>
              ))}
            </select>

            <Button
              onClick={handleQueryStageData}
              loading={isQueryingStage}
              disabled={!selectedStage || isUpdatingStage || isCheckingStage || isSubmittingCheck}
            >
              全量调整
            </Button>

            <Button
              variant="secondary"
              onClick={handleSelfCheck}
              loading={isCheckingStage}
              disabled={!selectedStage || isQueryingStage || isUpdatingStage || isSubmittingCheck}
            >
              智能自检
            </Button>
          </div>

          {showStageData && (
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <label className="text-sm text-gray-600">流程数据</label>
                <Button
                  onClick={handleUpdateStageData}
                  loading={isUpdatingStage}
                  disabled={!selectedStage || isQueryingStage}
                >
                  更新
                </Button>
              </div>
              <textarea
                className="w-full min-h-100 p-3 border border-gray-300 rounded-lg text-sm text-gray-900 font-mono focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={stageData}
                onChange={(e) => setStageData(e.target.value)}
                placeholder="请输入 JSON 字符串"
              />
            </div>
          )}

          {showSelfCheckData && (
            <div className="space-y-3 border-t border-gray-200 pt-4">
              <div className="flex items-center justify-between gap-3">
                <label className="text-sm text-gray-600">自检结果</label>
                <Button
                  onClick={handleSubmitSelfCheck}
                  loading={isSubmittingCheck}
                  disabled={isCheckingStage || selfCheckItems.length === 0}
                >
                  提交
                </Button>
              </div>

              {selfCheckItems.length === 0 ? (
                <div className="rounded-lg border border-dashed border-gray-300 px-4 py-6 text-sm text-gray-500">
                  当前阶段未返回自检项
                </div>
              ) : (
                <div className="space-y-4">
                  {selfCheckItems.map((item) => (
                    <div key={item.index} className="rounded-lg border border-gray-200 bg-gray-50 p-4 space-y-3">
                      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">#{item.index} {item.check_point}（{item.issue || '无'}）</p>
                        </div>
                      </div>

                      <div className="grid gap-3 text-sm text-gray-700">
                        <div>
                          <p className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-500">告警内容：{item.warning_content || '无'}</p>
                          <textarea
                            className="w-full min-h-24 rounded-lg border border-gray-300 bg-white p-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
                            value={item.confirm_content || ''}
                            onChange={(e) => handleConfirmContentChange(item.index, e.target.value)}
                            placeholder="请输入确认或修正后的内容"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* 文件列表 */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">生成文件</h3>

          {isLoadingFiles ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto" />
              <p className="mt-2 text-gray-500">加载中...</p>
            </div>
          ) : files.length === 0 ? (
            <div className="text-center py-8 text-gray-500">暂无生成文件</div>
          ) : (
            <div className="space-y-3">
              {files.map((file, index) => (
                <div
                  key={`${file.relative_path}-${index}`}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{file.file_name}</p>
                    <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                      <span>{formatFileSize(file.size_bytes)}</span>
                      <span>•</span>
                      <span>{formatDateTime(file.updated_at)}</span>
                    </div>
                  </div>

                  <Button
                    onClick={() => handleDownload(file)}
                    disabled={downloadingFile === file.file_name}
                    loading={downloadingFile === file.file_name}
                    size="sm"
                  >
                    下载
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 操作按钮 */}
        <div className="flex justify-center space-x-4 pt-4">
          {isPolling && (
            <Button variant="secondary" onClick={stopPolling}>
              停止轮询
            </Button>
          )}
          <Button onClick={onClose}>关闭</Button>
        </div>
      </div>
    </Modal>
  );
}