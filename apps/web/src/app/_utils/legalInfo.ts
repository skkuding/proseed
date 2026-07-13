// 개인정보처리방침(#73)·이용약관(#74) 공통 사업자/연락처 정보의 SSOT.
// 확정값은 그대로 노출하고, 미정값은 팀 결정 후 이 파일만 고치면 두 문서에 함께 반영된다.

/**
 * 팀 확정 전 미정값 표기.
 * 화면에 눈에 띄게 노출되어 "게시 전 반드시 채워야 함"을 알린다.
 * 출시(개인정보처리방침 게시) 블로커이므로 이 마커가 남아 있으면 게시하면 안 된다.
 */
export const TBD = '〔미정〕' as const

export const LEGAL_INFO = {
  // 확정 — 카톡 확보 (#73)
  company: '네포베이비',
  address: '경기 수원 장안구 화산로187번길 20-9 206호',
  serviceName: 'Proseed',
  /** 만 14세 이상만 가입 (법정대리인 동의 절차 불필요) */
  minAge: 14,

  // 미정 — 팀 결정 필요 (#73 선행 과제)
  /** 개인정보 보호책임자 이름 */
  privacyOfficerName: TBD,
  /** 개인정보 보호책임자 연락처 */
  privacyOfficerContact: TBD,
  /** 문의/CS 이메일 */
  csEmail: TBD,
  /** 시행일 (게시일) */
  effectiveDate: TBD,

  // 미정 — 티켓/피드백 정책 최종본 (#74 의존성)
  /** 티켓·피드백 정책 요약 (약관 반영 전 확정 필요) */
  ticketPolicySummary: TBD,
} as const
