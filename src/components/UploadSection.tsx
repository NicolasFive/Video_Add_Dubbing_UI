'use client';

import { useState, useRef } from 'react';
import { VOICE_TYPES } from '@/lib/types';
import type { Task } from '@/lib/types';
import { useUpload } from '@/hooks/useUpload';
import Button from './ui/Button';
import FileUpload from './ui/FileUpload';
import { showToast } from './ui/Toast';

interface UploadSectionProps {
  onTaskSubmit: (task: Task) => void;
}

export default function UploadSection({ onTaskSubmit }: UploadSectionProps) {
  const [selectedVideoFile, setSelectedVideoFile] = useState<File | null>(null);
  const [selectedAudioFile, setSelectedAudioFile] = useState<File | null>(null);
  const [voiceType, setVoiceType] = useState('zh_female_meilinvyou');
  const videoInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const { isUploading, submitUpload } = useUpload();

  const handleVideoFileSelect = (file: File) => {
    setSelectedVideoFile(file);
  };

  const handleAudioFileSelect = (file: File) => {
    setSelectedAudioFile(file);
  };

  const handleReset = () => {
    setSelectedVideoFile(null);
    setSelectedAudioFile(null);
    setVoiceType('zh_female_meilinvyou');
    if (videoInputRef.current) {
      videoInputRef.current.value = '';
    }
    if (audioInputRef.current) {
      audioInputRef.current.value = '';
    }
  };

  const handleSubmit = async () => {
    if (!selectedVideoFile && !selectedAudioFile) {
      showToast('请至少选择一个视频或音频文件', 'error');
      return;
    }

    try {
      const task: Task = await submitUpload({
        videoFile: selectedVideoFile || undefined,
        audioFile: selectedAudioFile || undefined,
        voiceType,
      });

      showToast('任务提交成功', 'success');
      onTaskSubmit(task);

      // 重置表单
      handleReset();
    } catch (error) {
      console.error('提交任务失败:', error);
      showToast('任务提交失败，请重试', 'error');
    }
  };

  return (
    <section className="bg-white rounded-xl shadow-md p-6 md:p-8">
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

        {/* 语音类型选择 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            配音语音
          </label>
          <select
            value={voiceType}
            onChange={(e) => setVoiceType(e.target.value)}
            className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-lg 
                       focus:ring-2 focus:ring-primary-500 focus:border-primary-500
                       bg-white text-gray-900"
          >
            {VOICE_TYPES.map((voice) => (
              <option key={voice.value} value={voice.value}>
                {voice.label}
              </option>
            ))}
          </select>
        </div>

        {/* 操作按钮 */}
        <div className="flex flex-col gap-3 md:flex-row">
          <Button
            size="lg"
            onClick={handleSubmit}
            disabled={(!selectedVideoFile && !selectedAudioFile) || isUploading}
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