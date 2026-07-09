import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    // 로컬 MinIO(localhost)는 사설 IP라 Next Image 옵티마이저의 SSRF 차단에 항상 걸림 → 로컬만 최적화 비활성화
    unoptimized: process.env.NODE_ENV === 'development',
    remotePatterns: [
      // 로컬 MinIO presigned URL
      { protocol: 'http', hostname: 'localhost', port: '9000' },
      // 프로덕션 S3 presigned URL (virtual-hosted style)
      { protocol: 'https', hostname: '*.s3.*.amazonaws.com' },
    ],
  },
  // 로컬 개발 전용: better-auth가 BETTER_AUTH_URL(localhost:3000) 기준으로 OAuth redirect_uri를 생성하므로
  // /api/auth/*를 3000에서도 받아 4000(API)으로 전달해야 콜백이 실제로 도달함.
  // 프로덕션은 ingress가 동일 도메인에서 경로로 라우팅하니 불필요.
  async rewrites() {
    if (process.env.NODE_ENV !== 'development') return []
    return [
      {
        source: '/api/auth/:path*',
        destination: 'http://localhost:4000/api/auth/:path*',
      },
    ]
  },
}

export default nextConfig
