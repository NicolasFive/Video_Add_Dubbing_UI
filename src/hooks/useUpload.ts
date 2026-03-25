import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { submitDubbingTask } from '@/lib/api';
import type { Task } from '@/lib/types';

interface SubmitUploadParams {
  videoFile?: File;
  audioFile?: File;
  voiceSource: string;
  voiceTypes: string[];
  lineType?: string;
  taskId?: string;
  startStep?: string;
  endStep?: string;
}

interface UseUploadReturn {
  isUploading: boolean;
  submitUpload: (params: SubmitUploadParams) => Promise<Task>;
}

export function useUpload(): UseUploadReturn {
  const [isUploading, setIsUploading] = useState(false);

  const submitUpload = async ({ videoFile, audioFile, voiceSource, voiceTypes, lineType, taskId, startStep, endStep }: SubmitUploadParams): Promise<Task> => {
    setIsUploading(true);

    try {
      const resolvedTaskId = taskId || uuidv4();
      const response = await submitDubbingTask(
        videoFile,
        audioFile,
        voiceTypes,
        lineType,
        resolvedTaskId,
        startStep,
        endStep
      );

      const sourceFileName = videoFile && audioFile
        ? `${videoFile.name} + ${audioFile.name}`
        : videoFile?.name || audioFile?.name;

      return {
        task_id: response.task_id,
        line_type: lineType,
        voice_types: voiceTypes,
        voice_source: voiceSource,
        status: response.status,
        progress: 0,
        current_step: '待处理',
        created_at: response.created_at,
        updated_at: new Date().toISOString(),
        source_file_name: sourceFileName,
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
