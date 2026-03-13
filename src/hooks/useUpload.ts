import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { submitDubbingTask } from '@/lib/api';
import type { Task } from '@/lib/types';

interface SubmitUploadParams {
  file: File;
  fileType: 'video' | 'audio';
  voiceType: string;
}

interface UseUploadReturn {
  isUploading: boolean;
  submitUpload: (params: SubmitUploadParams) => Promise<Task>;
}

export function useUpload(): UseUploadReturn {
  const [isUploading, setIsUploading] = useState(false);

  const submitUpload = async ({ file, fileType, voiceType }: SubmitUploadParams): Promise<Task> => {
    setIsUploading(true);

    try {
      const taskId = uuidv4();
      const response = await submitDubbingTask(
        fileType === 'video' ? file : undefined,
        fileType === 'audio' ? file : undefined,
        voiceType,
        taskId
      );

      return {
        task_id: response.task_id,
        status: response.status,
        progress: 0,
        current_step: '待处理',
        created_at: response.created_at,
        updated_at: new Date().toISOString(),
        source_file_name: file.name,
      };
    } finally {
      setIsUploading(false);
    }
  };

  return {
    isUploading,
    submitUpload,
  };
}
