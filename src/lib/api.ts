import axios from 'axios';
import type { 
  DubbingResponse, 
  StatusResponse, 
  ResultResponse,
  Task,
  TaskListItemResponse,
  OptimizeDataResponse,
  OptimizeUpdateResponse,
  OptimizeReduceResponse,
  SelfCheckResponse,
  CheckConfirmResponse,
  PipelineConfigResponse,
  PipelineLineTypesResponse
} from './types';
import { VOICE_TYPES } from './types';

// 创建 axios 实例
const apiClient = axios.create({
  // Use same-origin path so local dev keeps Next proxy and Docker uses Nginx proxy.
  baseURL: '/api',
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器 - 处理跨域
apiClient.interceptors.request.use(
  (config) => {
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
  endStep?: string,
  duckDb?: number,
  noCache?: boolean
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
  if (typeof duckDb === 'number') {
    formData.append('duck_db', String(duckDb));
  }
  formData.append('no_cache', String(noCache));

  const response = await apiClient.post<DubbingResponse>(
    '/v1/dubbing',
    formData,
    {
      timeout: 300000,
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

function normalizeTaskTimestamp(value?: string | null): string {
  if (!value) {
    return new Date().toISOString();
  }

  return value.includes('T') ? value : value.replace(' ', 'T');
}

function extractSourceFileName(filePath?: string | null): string | undefined {
  if (!filePath) {
    return undefined;
  }

  const segments = filePath.split(/[\\/]/);
  return segments[segments.length - 1] || undefined;
}

function inferVoiceSource(
  voiceSource?: string | null,
  voiceTypes?: string[] | null
): string | undefined {
  if (voiceSource) {
    return voiceSource;
  }

  const firstVoiceType = voiceTypes?.[0];
  if (!firstVoiceType) {
    return undefined;
  }

  return VOICE_TYPES.find((voice) => voice.value === firstVoiceType)?.source;
}

function mapTaskListItemToTask(item: TaskListItemResponse): Task {
  const normalizedVoiceTypes = Array.isArray(item.voice_types)
    ? item.voice_types.filter((voiceType): voiceType is string => typeof voiceType === 'string')
    : undefined;
  const normalizedTime = normalizeTaskTimestamp(item.update_time);

  return {
    task_id: item.task_id,
    line_type: item.line_type || undefined,
    voice_types: normalizedVoiceTypes,
    voice_source: inferVoiceSource(item.voice_source, normalizedVoiceTypes),
    duck_db: typeof item.duck_db === 'number' ? item.duck_db : undefined,
    no_cache: Boolean(item.no_cache),
    status: 'unknown',
    progress: 0,
    current_step: '待处理',
    created_at: normalizedTime,
    updated_at: normalizedTime,
    source_file_name: extractSourceFileName(item.input_video_path) || extractSourceFileName(item.input_audio_path),
  };
}

/**
 * 获取任务列表
 */
export async function getTaskList(): Promise<Task[]> {
  const response = await apiClient.get<TaskListItemResponse[]>(
    '/v1/result/list'
  );

  const baseTasks = response.data.map(mapTaskListItemToTask);
  if (baseTasks.length === 0) {
    return baseTasks;
  }

  const statusResults = await Promise.allSettled(
    baseTasks.map((task) => getTaskStatus(task.task_id))
  );

  return baseTasks.map((task, index) => {
    const statusResult = statusResults[index];
    if (statusResult.status !== 'fulfilled') {
      return task;
    }

    const statusData = statusResult.value;
    return {
      ...task,
      status: statusData.status,
      progress: statusData.progress,
      current_step: statusData.current_step || task.current_step,
      error_detail: statusData.error_detail,
      video_url: statusData.video_url,
      subtitle_url: statusData.subtitle_url,
    };
  });
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
 * 执行流程节点智能自检
 */
export async function getSelfCheckData(
  taskId: string,
  stage: string
): Promise<SelfCheckResponse> {
  const response = await apiClient.get<SelfCheckResponse>(
    `/v1/optimize/self_check/${taskId}`,
    {
      params: { stage },
    }
  );
  return response.data;
}

/**
 * 提交流程节点自检确认结果
 */
export async function submitCheckConfirm(
  taskId: string,
  stage: string,
  data: SelfCheckResponse['data']
): Promise<CheckConfirmResponse> {
  const formData = new FormData();
  formData.append('stage', stage);
  formData.append('data', JSON.stringify(data));

  const response = await apiClient.post<CheckConfirmResponse>(
    `/v1/optimize/check_confirm/${taskId}`,
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
 * 精简文本
 */
export async function reduceOptimizeText(
  taskId: string,
  text: string
): Promise<OptimizeReduceResponse> {
  const formData = new FormData();
  formData.append('text', text);

  const response = await apiClient.post<OptimizeReduceResponse>(
    `/v1/optimize/reduce/${taskId}`,
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