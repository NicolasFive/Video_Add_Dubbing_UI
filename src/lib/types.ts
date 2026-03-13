// API 响应类型定义

export interface DubbingRequest {
  video?: File;
  audio?: File;
  voice_type?: string;
  task_id?: string;
  start_step?: string;
  end_step?: string;
}

export interface DubbingResponse {
  task_id: string;
  status: 'pending' | 'processing' | 'success' | 'failed' | 'unknown';
  message: string;
  created_at: string;
}

export interface StatusResponse {
  task_id: string;
  status: 'pending' | 'processing' | 'success' | 'failed' | 'unknown';
  video_url: string | null;
  subtitle_url: string | null;
  error_detail: string | null;
  progress: number;
  current_step: string | null;
}

export interface ResultFile {
  file_name: string;
  relative_path: string;
  size_bytes: number;
  updated_at: string;
  download_url: string;
}

export interface ResultResponse {
  task_id: string;
  status: 'pending' | 'processing' | 'success' | 'failed' | 'unknown';
  files: ResultFile[];
  progress: number;
  current_step: string | null;
  error_detail: string | null;
}

// 本地任务类型
export interface Task {
  task_id: string;
  status: 'pending' | 'processing' | 'success' | 'failed' | 'unknown';
  progress: number;
  current_step: string | null;
  created_at: string;
  updated_at: string;
  video_url?: string | null;
  subtitle_url?: string | null;
  files?: ResultFile[];
  error_detail?: string | null;
  source_file_name?: string;
}

// 语音类型选项
export const VOICE_TYPES = [
  { value: 'zh_male_beijingxiaoye_emo_v2_mars_bigtts', label: '男声 - 北京小爷（多情感）' },
  { value: 'zh_male_jingqiangkanye_emo_mars_bigtts', label: '男声 - 京腔侃爷（多情感）' },
  { value: 'zh_male_guangzhoudege_emo_mars_bigtts', label: '男声 - 广州德哥（多情感）' },
  { value: 'ICL_zh_male_menyoupingxiaoge_ffed9fc2fee7_tob', label: '男声 - 闷油瓶小哥' },
  { value: 'ICL_zh_male_neiliancaijun_e991be511569_tob', label: '男声 - 内敛才俊' },
];