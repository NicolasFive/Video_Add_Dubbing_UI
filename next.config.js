/** @type {import('next').NextConfig} */
const nextConfig = {
  // 启用React严格模式
  reactStrictMode: true,

  // 放宽 Next 代理请求体限制，支持 1GB 文件上传
  experimental: {
    middlewareClientMaxBodySize: 1024 * 1024 * 1024,
  },

  // 跨域配置 - 通过API代理解决
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_BASE_URL}/v1/:path*`,
      },
    ];
  },

  // 图片优化配置
  images: {
    domains: ['127.0.0.1', 'localhost'],
  },

  // 环境变量
  env: {
    APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
  },
};

module.exports = nextConfig;