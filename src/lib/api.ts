import axios from 'axios';
import type { 
  DubbingResponse, 
  StatusResponse, 
  ResultResponse,
  OptimizeDataResponse,
  OptimizeUpdateResponse,
  PipelineConfigResponse,
  PipelineLineTypesResponse
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
  voiceTypes?: string[],
  lineType?: string,
  taskId?: string,
  startStep?: string,
  endStep?: string
): Promise<DubbingResponse> {
  const formData = new FormData();
  
  if (videoFile) {
    formData.append('video', videoFile);
  }
  if (audioFile) {
    formData.append('audio', audioFile);
  }
  if (voiceTypes && voiceTypes.length > 0) {
    voiceTypes.forEach((voiceType) => {
      formData.append('voice_types', voiceType);
    });
  }
  if (lineType) {
    formData.append('line_type', lineType);
  }
  if (taskId) {
    formData.append('task_id', taskId);
  }
  if (startStep) {
    formData.append('start_step', startStep);
  }
  if (endStep) {
    formData.append('end_step', endStep);
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
    `/v1/status/${taskId}`
  );
  return response.data;
}

/**
 * 获取任务结果
 */
export async function getTaskResult(taskId: string): Promise<ResultResponse> {
  const response = await apiClient.get<ResultResponse>(
    `/v1/result/${taskId}`
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
    `/v1/result/${taskId}/download`,
    {
      params: { file: filePath },
      responseType: 'blob',
    }
  );
  return response.data;
}

/**
 * 查询任务阶段数据
 */
export async function getOptimizeData(
  taskId: string,
  stage: string
): Promise<OptimizeDataResponse> {
  const response = await apiClient.get<OptimizeDataResponse>(
    `/v1/optimize/${taskId}`,
    {
      params: { stage },
    }
  );
  return response.data;
}

/**
 * 更新任务阶段数据
 */
export async function updateOptimizeData(
  taskId: string,
  stage: string,
  data: string
): Promise<OptimizeUpdateResponse> {
  const formData = new FormData();
  formData.append('stage', stage);
  formData.append('data', data);

  const response = await apiClient.post<OptimizeUpdateResponse>(
    `/v1/optimize/${taskId}`,
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
 * 获取流程配置
 */
export async function getPipelineConfig(lineType?: string): Promise<PipelineConfigResponse> {
  const response = await apiClient.get<PipelineConfigResponse>(
    '/v1/pipline/config',
    {
      params: lineType ? { line_type: lineType } : undefined,
    }
  );
  return response.data;
}

/**
 * 获取流程类型字典
 */
export async function getPipelineLineTypes(): Promise<PipelineLineTypesResponse> {
  const response = await apiClient.get<PipelineLineTypesResponse>(
    '/v1/pipline/line-types'
  );
  return response.data;
}

export default apiClient;