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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileType, setFileType] = useState<'video' | 'audio'>('video');
  const [voiceType, setVoiceType] = useState('zh_female_meilinvyou');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isUploading, submitUpload } = useUpload();

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    // 根据文件类型自动设置
    if (file.type.startsWith('audio/')) {
      setFileType('audio');
    } else if (file.type.startsWith('video/')) {
      setFileType('video');
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setFileType('video');
    setVoiceType('zh_female_meilinvyou');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      showToast('请选择要上传的文件', 'error');
      return;
    }

    try {
      const task: Task = await submitUpload({
        file: selectedFile,
        fileType,
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
        <FileUpload
          ref={fileInputRef}
          accept="video/*,audio/*"
          onFileSelect={handleFileSelect}
          selectedFile={selectedFile}
        />

        {/* 文件类型选择 */}
        <div className="flex flex-wrap gap-4">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="radio"
              name="fileType"
              value="video"
              checked={fileType === 'video'}
              onChange={() => setFileType('video')}
              className="w-4 h-4 text-primary-600"
            />
            <span className="text-gray-700">视频文件</span>
          </label>
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="radio"
              name="fileType"
              value="audio"
              checked={fileType === 'audio'}
              onChange={() => setFileType('audio')}
              className="w-4 h-4 text-primary-600"
            />
            <span className="text-gray-700">音频文件</span>
          </label>
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
            disabled={!selectedFile || isUploading}
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