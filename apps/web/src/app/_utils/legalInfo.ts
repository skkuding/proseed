// 개인정보처리방침(#73)·이용약관(#74) 공통 사업자/연락처 정보의 SSOT.
// 이 파일만 고치면 두 문서에 함께 반영된다.

export const LEGAL_INFO = {
  company: '네포베이비',
  address: '경기 수원 장안구 화산로187번길 20-9 206호',
  serviceName: 'Proseed',
  /** 만 14세 이상만 가입 (법정대리인 동의 절차 불필요) */
  minAge: 14,

  // 확정 (#73/#74)
  /** 개인정보 보호책임자 이름 */
  privacyOfficerName: '신보민',
  /** 개인정보 보호책임자 연락처 (프로젝트 대표 공용 계정) */
  privacyOfficerContact: 'nepo26b13@gmail.com',
  /** 문의/CS 이메일 (프로젝트 대표 공용 계정) */
  csEmail: 'nepo26b13@gmail.com',
  /** 시행일 (게시일 = 출시일) */
  effectiveDate: '2026년 7월 27일',
} as const
