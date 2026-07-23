import { sendGAEvent } from '@next/third-parties/google'

/**
 * GA4 커스텀 이벤트 목록과 각 이벤트의 매개변수 타입.
 * 측정 ID가 주입된 프로덕션 빌드에서만 실제 전송되고, 그 외 환경에서는 조용히 무시된다.
 */
type EventParams = {
  // Stage 0 — 획득
  /** 랜딩 CTA 클릭. location 은 클릭한 위치(hero/header/recent_projects). */
  cta_clicked: { location: string }
  /** 소셜 로그인 버튼 클릭. method 는 제공자(google/kakao/naver). */
  login_started: { method: string }

  // Stage 1 — 활성화
  /** 신규 회원 가입 완료(온보딩 완료). method 는 소셜 로그인 제공자. */
  sign_up: { method?: string }
  /** 프로젝트 등록 폼 진입. 제출 대비 이탈률 측정용. */
  project_registration_started: Record<string, never>
  /** 프로젝트 등록 완료. 활성화 지표. */
  project_created: { project_type?: string; category?: string }
  /** 성장기록 버전 발행. 등록 후 방치 vs 기록 시작을 가르는 핵심 고리. */
  growth_record_published: { version?: string }

  // Stage 2 — 핵심 가치: 피드백 루프
  /** 프로젝트 상세 조회. is_own 은 본인 프로젝트 여부. */
  project_viewed: { is_own: boolean; project_type?: string }
  /** 피드백 작성 폼 진입. 제출 대비 이탈률 측정용. */
  feedback_started: Record<string, never>
  /** 피드백 제출 완료. 핵심 참여 행동. */
  feedback_submitted: { question_count: number }
  /** 발행 시 피드백 채택. 받은 피드백이 성장으로 이어지는 가치 실현. */
  feedback_adopted: { adopted_count: number }

  // Stage 3 — 포트폴리오·팀·유지
  /** 유저 포트폴리오 조회. is_own 은 본인 여부. */
  portfolio_viewed: { is_own: boolean }
  /** 협업자 초대 완료. role 은 초대된 직군. */
  collaborator_invited: { role: string }
  /** 프로필 수정 완료. */
  profile_updated: Record<string, never>

  // Stage 4 — 이탈
  /** 회원 탈퇴 완료. reason 은 탈퇴 사유. */
  account_deletion: { reason?: string }
}

/** GA4 커스텀 이벤트를 전송한다. */
export function trackEvent<K extends keyof EventParams>(name: K, params: EventParams[K]): void {
  sendGAEvent('event', name, params)
}

/**
 * 로그인 사용자를 GA4 User-ID 로 연결한다.
 * 원본 식별자를 그대로 보내지 않고 SHA-256 해시만 전송한다.
 */
export async function setAnalyticsUserId(rawUserId: string): Promise<void> {
  const hashed = await sha256Hex(rawUserId)
  sendGAEvent('set', { user_id: hashed })
}

async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}
