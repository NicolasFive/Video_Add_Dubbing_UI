'use client';

import { useState, useEffect } from 'react';
import { getTaskResult, downloadFile } from '@/lib/api';
import type { Task, ResultFile } from '@/lib/types';
import Modal from './ui/Modal';
import Button from './ui/Button';
import { showToast } from './ui/Toast';
import { formatDateTime, formatFileSize } from '@/lib/utils';

interface ResultModalProps {
  task: Task;
  onClose: () => void;
}

export default function ResultModal({ task, onClose }: ResultModalProps) {
  const [files, setFiles] = useState<ResultFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [downloadingFile, setDownloadingFile] = useState<string | null>(null);

  // 获取任务结果
  useEffect(() => {
    const fetchResult = async () => {
      try {
        const result = await getTaskResult(task.task_id);
        setFiles(result.files || []);
      } catch (error) {
        console.error('获取结果失败:', error);
        showToast('获取结果失败', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    // 如果已有文件数据，直接使用
    if (task.files && task.files.length > 0) {
      setFiles(task.files);
      setIsLoading(false);
    } else {
      fetchResult();
    }
  }, [task.task_id, task.files]);

  // 处理文件下载
  const handleDownload = async (file: ResultFile) => {
    setDownloadingFile(file.file_name);
    try {
      const blob = await downloadFile(task.task_id, file.relative_path);
      
      // 创建下载链接
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.file_name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      showToast('下载成功', 'success');
    } catch (error) {
      console.error('下载失败:', error);
      showToast('下载失败，请重试', 'error');
    } finally {
      setDownloadingFile(null);
    }
  };


  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="任务结果"
      size="lg"
    >
      <div className="space-y-6">
        {/* 任务状态 */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <p className="text-sm text-gray-500">任务状态</p>
            <p className={`font-medium ${
              task.status === 'success' ? 'text-green-600' :
              task.status === 'failed' ? 'text-red-600' :
              'text-gray-600'
            }`}>
              {task.status === 'success' ? '✅ 已完成' :
               task.status === 'failed' ? '❌ 失败' :
               task.status}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">进度</p>
            <p className="font-medium text-gray-900">{task.progress}%</p>
          </div>
        </div>

        {/* 文件列表 */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            生成文件
          </h3>

          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto" />
              <p className="mt-2 text-gray-500">加载中...</p>
            </div>
          ) : files.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              暂无生成文件
            </div>
          ) : (
            <div className="space-y-3">
              {files.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 border 
                             border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">
                      {file.file_name}
                    </p>
                    <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                      <span>{formatFileSize(file.size_bytes)}</span>
                      <span>•</span>
                      <span>
                        {formatDateTime(file.updated_at)}
                      </span>
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

        {/* 关闭按钮 */}
        <div className="flex justify-center pt-4">
          <Button onClick={onClose}>
            关闭
          </Button>
        </div>
      </div>
    </Modal>
  );
}