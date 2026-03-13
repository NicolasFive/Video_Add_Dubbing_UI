import axios from 'axios';
import type { 
  DubbingRequest, 
  DubbingResponse, 
  StatusResponse, 
  ResultResponse 
} from './types';

// 创建 axios 实例
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000',
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器 - 处理跨域
apiClient.interceptors.request.use(
  (config) => {
    // 开发环境下使用代理
    if (process.env.NODE_ENV === 'development') {
      config.baseURL = '/api';
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 响应拦截器 - 统一错误处理
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

/**
 * 提交配音任务
 */
export async function submitDubbingTask(
  videoFile?: File,
  audioFile?: File,
  voiceType?: string,
  taskId?: string
): Promise<DubbingResponse> {
  const formData = new FormData();
  
  if (videoFile) {
    formData.append('video', videoFile);
  }
  if (audioFile) {
    formData.append('audio', audioFile);
  }
  if (voiceType) {
    formData.append('voice_type', voiceType);
  }
  if (taskId) {
    formData.append('task_id', taskId);
  }

  const response = await apiClient.post<DubbingResponse>(
    '/v1/dubbing',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  
  return response.data;
}

/**
 * 查询任务状态
 */
export async function getTaskStatus(taskId: string): Promise<StatusResponse> {
  const response = await apiClient.get<StatusResponse>(
    `/v1/status/task_id/${taskId}`
  );
  return response.data;
}

/**
 * 获取任务结果
 */
export async function getTaskResult(taskId: string): Promise<ResultResponse> {
  const response = await apiClient.get<ResultResponse>(
    `/v1/result/task_id/${taskId}`
  );
  return response.data;
}

/**
 * 下载文件
 */
export async function downloadFile(
  taskId: string,
  filePath: string
): Promise<Blob> {
  const response = await apiClient.get(
    `/v1/result/task_id/${taskId}/download`,
    {
      params: { file: filePath },
      responseType: 'blob',
    }
  );
  return response.data;
}

export default apiClient;