import { sendGAEvent } from '@next/third-parties/google'

/**
 * GA4 커스텀 이벤트 목록과 각 이벤트의 매개변수 타입.
 * 측정 ID가 주입된 프로덕션 빌드에서만 실제 전송되고, 그 외 환경에서는 조용히 무시된다.
 */
type EventParams = {
  /** 신규 회원 가입 완료. method 는 소셜 로그인 제공자(google/kakao/naver). */
  sign_up: { method?: string }
  /** 프로젝트 등록 완료. 활성화 지표. */
  project_created: { project_type?: string }
  /** 피드백 제출 완료. 핵심 참여 행동. */
  feedback_submitted: { question_count: number }
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
