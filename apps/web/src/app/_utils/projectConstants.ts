// ─── 카테고리 ──────────────────────────────────────────────────────────────────
export const categories = [
  { label: '전체', icon: undefined },
  { label: '헬스케어', icon: '/healthcare_color.svg' },
  { label: '금융', icon: '/money_color.svg' },
  { label: '공공 · 정부', icon: '/government_color.svg' },
  { label: '커머스', icon: '/commerce_color.svg' },
  { label: '교육', icon: '/education_color.svg' },
  { label: '엔터테인먼트', icon: '/entertainment_color.svg' },
  { label: '모빌리티', icon: '/mobility_color.svg' },
  { label: '에너지 · 환경', icon: '/energy_color.svg' },
  { label: '부동산 · 건설', icon: '/construction_color.svg' },
  { label: '라이프스타일', icon: '/lifestyle_color.svg' },
  { label: '생산성', icon: '/production_color.svg' },
  { label: '커뮤니티', icon: '/community_color.svg' },
  { label: '인공지능', icon: '/ai_color.svg' },
] as const

export type CategoryLabel = (typeof categories)[number]['label']

// 백엔드 ProjectCategory enum 기준 (한국어 → API)
export const CATEGORY_TO_API: Record<string, string> = {
  헬스케어: 'HEALTHCARE',
  금융: 'FINANCE',
  '공공 · 정부': 'PUBLIC',
  커머스: 'COMMERCE',
  교육: 'EDUCATION',
  엔터테인먼트: 'ENTERTAINMENT',
  모빌리티: 'MOBILITY',
  '에너지 · 환경': 'ENERGY',
  '부동산 · 건설': 'REALESTATE',
  라이프스타일: 'LIFESTYLE',
  생산성: 'PRODUCTIVITY',
  커뮤니티: 'COMMUNITY',
  인공지능: 'AI',
}

// API → 한국어 (역매핑)
export const CATEGORY_LABELS: Record<string, string> = Object.fromEntries(
  Object.entries(CATEGORY_TO_API).map(([k, v]) => [v, k])
)

// ─── 프로젝트 상태 (백엔드 ProjectStatus enum) ──────────────────────────────
export const STATUS_TO_API: Record<string, string> = {
  '서비스 이용 가능': 'Available',
  'MVP 이용 가능': 'MVP',
  '개발 진행 중': 'Ongoing',
  '새로운 인력 모집 중': 'Hiring',
}

export const STATUS_OPTIONS = [
  '서비스 이용 가능',
  'MVP 이용 가능',
  '개발 진행 중',
  '새로운 인력 모집 중',
] as const

// ─── 직군 (백엔드 JobType enum, Prisma) ────────────────────────────────────
export const JOB_TO_API: Record<string, string> = {
  기획자: 'Planner',
  디자이너: 'Designer',
  개발자: 'Developer',
  기타: 'Other',
}

export const JOB_TABS = ['기획자', '디자이너', '개발자', '기타'] as const
export type JobTab = (typeof JOB_TABS)[number]

// ─── 공통 타입 ──────────────────────────────────────────────────────────────
export type Member = {
  email: string
  role: JobTab
  name: string
  ownRole: string
  profileImageUrl: string
}
export type ImageItem = { file: File; preview: string }
