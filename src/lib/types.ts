// API 响应类型定义

export interface DubbingRequest {
  video?: File;
  audio?: File;
  voice_types?: string[];
  line_type?: string;
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

export interface OptimizeDataResponse {
  task_id: string;
  stage: string;
  data: string;
}

export interface OptimizeUpdateResponse {
  task_id: string;
  stage: string;
  message: string;
}

export interface PipelineStage {
  key: string;
  name: string;
}

export interface PipelineConfigResponse {
  stages: PipelineStage[];
}

export interface PipelineLineTypesResponse {
  line_types: string[];
}

// 本地任务类型
export interface Task {
  task_id: string;
  line_type?: string;
  voice_types?: string[];
  voice_source?: string;
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


// 语音来源选项
export const VOICE_SOURCES = [
  { value: 'doubao_v1', label: '豆包语音1.0' },
  { value: 'doubao_v2', label: '豆包语音2.0' },
];

// 语音类型选项
export const VOICE_TYPES = [
  // 豆包语音1.0版本
  { value: 'zh_male_jingqiangkanye_emo_mars_bigtts', label: '男声 - 京腔侃爷（多情感）', source: 'doubao_v1' },
  { value: 'zh_male_guangzhoudege_emo_mars_bigtts', label: '男声 - 广州德哥（多情感）', source: 'doubao_v1' },
  { value: 'ICL_zh_male_menyoupingxiaoge_ffed9fc2fee7_tob', label: '男声 - 闷油瓶小哥', source: 'doubao_v1' },
  { value: 'ICL_zh_male_neiliancaijun_e991be511569_tob', label: '男声 - 内敛才俊', source: 'doubao_v1' },
  { value: 'zh_female_linjuayi_emo_v2_mars_bigtts', label: '女声 - 邻居阿姨（多情感）', source: 'doubao_v1' },
  // 豆包语音2.0版本
  { value: 'zh_male_shaonianzixin_uranus_bigtts', label: '男声 - 少年梓辛/Brayan 2.0', source: 'doubao_v2' },
  { value: 'saturn_zh_male_shuanglangshaonian_tob', label: '男声 - 爽朗少年', source: 'doubao_v2' },
  { value: 'zh_male_liufei_uranus_bigtts', label: '男声 - 刘飞 2.0', source: 'doubao_v2' },
  { value: 'zh_male_ruyayichen_uranus_bigtts', label: '男声 - 儒雅逸辰 2.0', source: 'doubao_v2' },
  { value: 'zh_female_jitangnv_uranus_bigtts', label: '女声 - 鸡汤女 2.0', source: 'doubao_v2' },
  { value: 'zh_male_sophie_uranus_bigtts', label: '女声 - 魅力苏菲 2.0', source: 'doubao_v2' },
  { value: 'zh_female_meilinvyou_uranus_bigtts', label: '女声 - 魅力女友 2.0', source: 'doubao_v2' },
  { value: 'zh_female_cancan_uranus_bigtts', label: '女声 - 知性灿灿 2.0', source: 'doubao_v2' },
  { value: 'zh_male_taocheng_uranus_bigtts', label: '男声 - 小天 2.0', source: 'doubao_v2' },
  { value: 'zh_male_m191_uranus_bigtts', label: '男声 - 云州 2.0', source: 'doubao_v2' }
];