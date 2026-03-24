'use client';

import { useState, useRef, useEffect } from 'react';
import { VOICE_TYPES, VOICE_SOURCES } from '@/lib/types';
import type { Task } from '@/lib/types';
import { useUpload } from '@/hooks/useUpload';
import { getPipelineConfig, getPipelineLineTypes } from '@/lib/api';
import Button from './ui/Button';
import FileUpload from './ui/FileUpload';
import { showToast } from './ui/Toast';

type RetryTaskContext = {
  taskId: string;
  lineType?: string;
};

interface UploadSectionProps {
  onTaskSubmit: (task: Task) => void;
  retryTask: RetryTaskContext | null;
  onCancelRetry: () => void;
}

type PipelineStepOption = {
  value: string;
  label: string;
};

export default function UploadSection({ onTaskSubmit, retryTask, onCancelRetry }: UploadSectionProps) {
  const [selectedVideoFile, setSelectedVideoFile] = useState<File | null>(null);
  const [selectedAudioFile, setSelectedAudioFile] = useState<File | null>(null);
  const [voiceSource, setVoiceSource] = useState('doubao_v1');
  const [voiceTypes, setVoiceTypes] = useState<string[]>([
    VOICE_TYPES.find(v => v.source === 'doubao_v1')?.value ?? '',
  ]);
  const [lineTypes, setLineTypes] = useState<string[]>([]);
  const [selectedLineType, setSelectedLineType] = useState<string>('');
  const [pipelineSteps, setPipelineSteps] = useState<PipelineStepOption[]>([]);
  const [startStep, setStartStep] = useState<string | null>(null);
  const [endStep, setEndStep] = useState<string | null>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const { isUploading, submitUpload } = useUpload();

  useEffect(() => {
    const fetchLineTypes = async () => {
      try {
        const data = await getPipelineLineTypes();
        if (Array.isArray(data.line_types)) {
          setLineTypes(data.line_types);
        }
      } catch (error) {
        console.error('获取流程类型失败:', error);
        showToast('获取流程类型失败，已使用默认类型', 'error');
      }
    };

    fetchLineTypes();
  }, []);

  useEffect(() => {
    const fetchPipelineConfig = async () => {
      try {
        const config = await getPipelineConfig(selectedLineType || undefined);
        setPipelineSteps(
          (config.stages || []).map((stage) => ({
            value: stage.key,
            label: stage.name,
          }))
        );
      } catch (error) {
        console.error('获取流程配置失败:', error);
        showToast('获取流程配置失败，已使用默认流程', 'error');
      }
    };

    fetchPipelineConfig();
  }, [selectedLineType]);

  useEffect(() => {
    setSelectedLineType(retryTask?.lineType ?? '');
  }, [retryTask]);

  useEffect(() => {
    if (startStep && !pipelineSteps.some((s) => s.value === startStep)) {
      setStartStep(null);
      setEndStep(null);
      return;
    }

    if (endStep && !pipelineSteps.some((s) => s.value === endStep)) {
      setEndStep(null);
    }
  }, [pipelineSteps, startStep, endStep]);

  const handleVideoFileSelect = (file: File) => {
    setSelectedVideoFile(file);
  };

  const handleAudioFileSelect = (file: File) => {
    setSelectedAudioFile(file);
  };

  const handleStepClick = (value: string, idx: number) => {
    if (!startStep) {
      setStartStep(value);
      setEndStep(null);
      return;
    }
    if (startStep && !endStep) {
      const startIdx = pipelineSteps.findIndex(s => s.value === startStep);
      if (idx >= startIdx) {
        // same node or later → set as end (allows start === end)
        setEndStep(value);
      } else {
        setStartStep(value);
      }
      return;
    }
    // both set — reset and start new
    setStartStep(value);
    setEndStep(null);
  };

  const handleVoiceSourceChange = (source: string) => {
    setVoiceSource(source);
    const firstVoice = VOICE_TYPES.find(v => v.source === source);
    const fallbackVoice = firstVoice?.value ?? '';
    setVoiceTypes((currentVoiceTypes) =>
      currentVoiceTypes.length === 0
        ? [fallbackVoice]
        : currentVoiceTypes.map((voiceType) =>
          VOICE_TYPES.some((voice) => voice.source === source && voice.value === voiceType)
            ? voiceType
            : fallbackVoice
        )
    );
  };

  const filteredVoiceTypes = VOICE_TYPES.filter(v => v.source === voiceSource);

  const handleVoiceTypeChange = (index: number, value: string) => {
    setVoiceTypes((currentVoiceTypes) =>
      currentVoiceTypes.map((voiceType, currentIndex) =>
        currentIndex === index ? value : voiceType
      )
    );
  };

  const handleAddVoiceType = () => {
    const fallbackVoice = filteredVoiceTypes[0]?.value ?? '';
    setVoiceTypes((currentVoiceTypes) => [...currentVoiceTypes, fallbackVoice]);
  };

  const handleRemoveVoiceType = (index: number) => {
    setVoiceTypes((currentVoiceTypes) => {
      if (currentVoiceTypes.length <= 1) {
        return currentVoiceTypes;
      }

      return currentVoiceTypes.filter((_, currentIndex) => currentIndex !== index);
    });
  };

  const handleReset = () => {
    setSelectedVideoFile(null);
    setSelectedAudioFile(null);
    setVoiceSource('doubao_v1');
    setVoiceTypes([VOICE_TYPES.find(v => v.source === 'doubao_v1')?.value ?? '']);
    setSelectedLineType(retryTask?.lineType ?? '');
    setStartStep(null);
    setEndStep(null);
    if (videoInputRef.current) {
      videoInputRef.current.value = '';
    }
    if (audioInputRef.current) {
      audioInputRef.current.value = '';
    }
  };

  const handleSubmit = async () => {
    if (!selectedVideoFile && !selectedAudioFile && !retryTask) {
      showToast('请至少选择一个视频或音频文件', 'error');
      return;
    }

    try {
      const task: Task = await submitUpload({
        videoFile: selectedVideoFile || undefined,
        audioFile: selectedAudioFile || undefined,
        voiceTypes,
        lineType: selectedLineType || undefined,
        taskId: retryTask?.taskId,
        startStep: startStep ?? undefined,
        endStep: endStep ?? undefined,
      });

      showToast('任务提交成功', 'success');
      onTaskSubmit(task);

      if (retryTask) {
        onCancelRetry();
      }

      // 重置表单
      handleReset();
    } catch (error) {
      console.error('提交任务失败:', error);
      showToast('任务提交失败，请重试', 'error');
    }
  };

  return (
    <section className="bg-white rounded-xl shadow-md p-6 md:p-8">
      {retryTask && (
        <div className="mb-4 flex flex-col gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-medium text-amber-800">当前正在重试任务</p>
            <p className="mt-1 break-all font-mono text-sm text-amber-700">task_id: {retryTask.taskId}</p>
            <p className="mt-1 break-all font-mono text-sm text-amber-700">line_type: {retryTask.lineType || 'default'}</p>
          </div>
          <Button
            type="button"
            variant="secondary"
            onClick={onCancelRetry}
            disabled={isUploading}
          >
            取消重试
          </Button>
        </div>
      )}

      <h2 className="text-2xl font-semibold text-gray-900 mb-6">
        上传文件
      </h2>

      <div className="space-y-6">
        {/* 文件上传区域 */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <h3 className="text-base font-medium text-gray-800">上传视频</h3>
            <FileUpload
              id="video-upload"
              ref={videoInputRef}
              accept="video/*"
              title="拖拽视频到这里，或点击选择"
              description="支持常见视频格式"
              onFileSelect={handleVideoFileSelect}
              selectedFile={selectedVideoFile}
            />
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-medium text-gray-800">上传音频（可选）</h3>
            <FileUpload
              id="audio-upload"
              ref={audioInputRef}
              accept="audio/*"
              title="拖拽音频到这里，或点击选择"
              description="支持常见音频格式"
              onFileSelect={handleAudioFileSelect}
              selectedFile={selectedAudioFile}
            />
          </div>
        </div>

        {/* 处理流程 */}
        <div>
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-2">流程类型</label>
            <div className="flex flex-wrap gap-2">
              <label className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 transition-colors hover:border-primary-300">
                <input
                  type="radio"
                  name="line-type"
                  value=""
                  checked={selectedLineType === ''}
                  onChange={() => setSelectedLineType('')}
                  className="h-4 w-4 border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span>default（默认）</span>
              </label>
              {lineTypes.filter((lineType) => lineType !== 'default').map((lineType) => (
                <label
                  key={lineType}
                  className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 transition-colors hover:border-primary-300"
                >
                  <input
                    type="radio"
                    name="line-type"
                    value={lineType}
                    checked={selectedLineType === lineType}
                    onChange={() => setSelectedLineType(lineType)}
                    className="h-4 w-4 border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span>{lineType}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">处理流程</label>
            <span className="text-xs text-gray-400">
              {startStep && endStep
                ? startStep === endStep
                  ? `仅执行：${pipelineSteps.find(s => s.value === startStep)?.label}`
                  : `${pipelineSteps.find(s => s.value === startStep)?.label} → ${pipelineSteps.find(s => s.value === endStep)?.label}`
                : startStep
                  ? '点击同一或后续节点设为结束步骤'
                  : '默认全流程，点击节点可选择范围'}
            </span>
          </div>
          <div className="overflow-x-auto pb-1">
            <div className="flex items-center min-w-max gap-0">
              {pipelineSteps.map((step, idx) => {
                const startIdx = pipelineSteps.findIndex(s => s.value === startStep);
                const endIdx = pipelineSteps.findIndex(s => s.value === endStep);
                const isStart = step.value === startStep;
                const isEnd = step.value === endStep;
                const inRange = startStep !== null && endStep !== null && idx > startIdx && idx < endIdx;
                const isConnectorActive = startStep !== null && endStep !== null && idx - 1 >= startIdx && idx - 1 < endIdx;

                return (
                  <div key={step.value} className="flex items-center">
                    {idx > 0 && (
                      <div className={`h-0.5 w-4 flex-shrink-0 transition-colors duration-150 ${isConnectorActive ? 'bg-primary-500' : 'bg-gray-200'
                        }`} />
                    )}
                    <button
                      type="button"
                      onClick={() => handleStepClick(step.value, idx)}
                      className={`flex flex-col items-center px-2 py-1.5 rounded-lg border text-xs
                        font-medium transition-all duration-150 flex-shrink-0 w-16 select-none
                        ${isStart
                          ? 'bg-primary-500 text-white border-primary-500 shadow-sm'
                          : isEnd
                            ? 'bg-primary-700 text-white border-primary-700 shadow-sm'
                            : inRange
                              ? 'bg-primary-100 text-primary-700 border-primary-300'
                              : 'bg-gray-50 text-gray-500 border-gray-200 hover:border-primary-300 hover:bg-primary-50 hover:text-primary-600'
                        }`}
                    >
                      <span className="text-[9px] leading-none mb-0.5 h-3">
                        {isStart && isEnd ? '开始&结束' : isStart ? '开始' : isEnd ? '结束' : ''}
                      </span>
                      <span className="leading-tight text-center" style={{ fontSize: '11px' }}>{step.label}</span>
                      <span className="text-[9px] leading-none mt-0.5 opacity-50">{idx + 1}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
          {(startStep || endStep) && (
            <button
              type="button"
              onClick={() => { setStartStep(null); setEndStep(null); }}
              className="mt-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors"
            >
              × 清除范围选择（执行全流程）
            </button>
          )}
        </div>

        {/* 语音类型选择 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            配音语音
          </label>
          <div className="flex flex-col gap-3">
            <select
              value={voiceSource}
              onChange={(e) => handleVoiceSourceChange(e.target.value)}
              className="w-full md:w-40 px-4 py-2 border border-gray-300 rounded-lg
                         focus:ring-2 focus:ring-primary-500 focus:border-primary-500
                         bg-white text-gray-900"
            >
              {VOICE_SOURCES.map((src) => (
                <option key={src.value} value={src.value}>
                  {src.label}
                </option>
              ))}
            </select>
            <div className="space-y-3">
              {voiceTypes.map((voiceType, index) => (
                <div key={`${voiceType}-${index}`} className="flex items-center gap-2">
                  Speaker {index + 1}:
                  <select
                    value={voiceType}
                    onChange={(e) => handleVoiceTypeChange(index, e.target.value)}
                    className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-lg
                               focus:ring-2 focus:ring-primary-500 focus:border-primary-500
                               bg-white text-gray-900"
                  >
                    {filteredVoiceTypes.map((voice) => (
                      <option key={voice.value} value={voice.value}>
                        {voice.label}
                      </option>
                    ))}
                  </select>

                  {index === 0 ? (
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={handleAddVoiceType}
                      className="px-4 py-2"
                    >
                      +
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      variant="danger"
                      onClick={() => handleRemoveVoiceType(index)}
                      className="px-4 py-2"
                    >
                      删除
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex flex-col gap-3 md:flex-row">
          <Button
            size="lg"
            onClick={handleSubmit}
            disabled={(!selectedVideoFile && !selectedAudioFile && !retryTask) || isUploading}
            loading={isUploading}
            className="w-full md:w-auto"
          >
            {isUploading ? '正在提交任务...' : '提交任务'}
          </Button>

          <Button
            variant="secondary"
            onClick={handleReset}
            disabled={isUploading}
            className="w-full md:w-auto px-8 py-3"
          >
            重置
          </Button>
        </div>
      </div>
    </section>
  );
}