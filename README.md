# 听译加 - 视频翻译配音工具

基于 Next.js + React + Tailwind CSS 构建的视频翻译配音前端应用。

**注意：须配合后端一起部署使用**[→点击跳转←](https://github.com/NicolasFive/Video_Add_Dubbing_API.git)

## 功能特性

- 📤 视频/音频文件上传
- 🔄 实时任务进度展示
- 📋 历史任务管理
- 📥 结果文件下载
- 📱 响应式设计，兼容PC和移动端


![alt text](screenshot/image1.png)
![alt text](screenshot/image2.png)

## 技术栈

- **框架**: Next.js 15 + React 19
- **样式**: Tailwind CSS 4
- **状态管理**: Zustand
- **HTTP 客户端**: Axios
- **工具库**: UUID, date-fns

## 快速开始

```bash
# 安装依赖
npm install
```

配置环境变量（复制示例文件）：

```bash
# macOS / Linux
cp .env.example .env.local

# Windows (PowerShell)
Copy-Item .env.example .env.local

# Windows (CMD)
copy .env.example .env.local
```

根据实际情况修改 `.env.local` 中的 `NEXT_PUBLIC_API_BASE_URL`，然后启动：

```bash
# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 启动生产服务器
npm start
```

## 环境变量

| 变量名 | 默认值 | 说明 |
|---|---|---|
| `NEXT_PUBLIC_API_BASE_URL` | `http://127.0.0.1:8000` | 后端 API 地址 |
| `NEXT_PUBLIC_APP_NAME` | `听译加` | 应用名称 |
| `NEXT_PUBLIC_POLLING_INTERVAL` | `2000` | 任务状态轮询间隔（毫秒）|
| `NEXT_PUBLIC_MAX_POLLING_TIME` | `3600000` | 最长轮询时间（毫秒，默认 1 小时）|

## 项目结构

```
tingyi-jia/
├── .env.local                          # 环境变量配置（本地，不提交 git）
├── .env.example                        # 环境变量示例
├── next.config.js                      # Next.js 配置
├── tailwind.config.js                  # Tailwind CSS 配置
├── postcss.config.js                   # PostCSS 配置
├── package.json                        # 项目依赖
├── tsconfig.json                       # TypeScript 配置
├── public/
│   ├── favicon.ico                     # 网站图标
│   └── logo.svg                        # 应用Logo
├── src/
│   ├── app/
│   │   ├── layout.tsx                  # 根布局
│   │   ├── page.tsx                    # 首页
│   │   ├── globals.css                 # 全局样式
│   │   └── api/
│   │       └── proxy/
│   │           └── route.ts            # API代理路由（解决跨域）
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Button.tsx              # 按钮组件
│   │   │   ├── Modal.tsx               # 模态框组件
│   │   │   ├── ProgressBar.tsx         # 进度条组件
│   │   │   ├── FileUpload.tsx          # 文件上传组件
│   │   │   └── Toast.tsx               # 提示组件
│   │   ├── Header.tsx                  # 头部导航
│   │   ├── TaskList.tsx                # 任务列表
│   │   ├── TaskItem.tsx                # 任务项
│   │   ├── UploadSection.tsx           # 上传区域
│   │   ├── ProgressModal.tsx           # 进度模态框
│   │   └── ResultModal.tsx             # 结果模态框
│   ├── hooks/
│   │   ├── useTaskPolling.ts           # 任务轮询Hook
│   │   ├── useLocalStorage.ts          # 本地存储Hook
│   │   └── useUpload.ts                # 上传Hook
│   ├── lib/
│   │   ├── api.ts                      # API请求封装
│   │   ├── utils.ts                    # 工具函数
│   │   └── types.ts                    # TypeScript类型定义
│   └── stores/
│       └── taskStore.ts                # 任务状态管理
└── README.md                           # 项目说明
```
