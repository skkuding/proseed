/** 사이트 정식 도메인 — metadataBase·canonical·robots·sitemap 공용 SSOT */
export const SITE_URL = 'https://proseednow.com'

/** 사이트 기본 설명 (메타데이터·OG 공용) */
export const SITE_DESCRIPTION =
  'PROSEED는 흩어진 프로젝트 기록을 모으고, 낯선 피드백으로 성장하며, 독보적인 포트폴리오를 완성하는 공간입니다.'

/**
 * GA4 측정 ID (SSOT). 브라우저에 그대로 노출되는 공개 식별자라 시크릿이 아니다.
 * 홈은 정적 프리렌더라 이 값은 빌드 시점에 HTML 로 굳는다 — 런타임 env 로는 주입되지 않으므로
 * 빌드 env 주입 파이프라인에 의존하지 않도록 상수로 둔다.
 */
export const GA_MEASUREMENT_ID = 'G-X9Z2BWG12G'

/**
 * 검색엔진 색인 허용 여부 (SSOT).
 * 출시 전: false → 전체 noindex (미완성 페이지 색인 방지).
 * 출시일: true 로 플립 → 색인 허용. 커밋 히스토리에 색인 개시 시점이 남는다.
 */
export const ALLOW_INDEXING = false

/**
 * 검색엔진 소유확인(verification) 코드 (SSOT).
 * 구글 서치콘솔 / 네이버 서치어드바이저에서 발급받는 공개 문자열이다.
 * 공용 계정 확보(#72 선행 과제) 후 발급받아 채운다.
 * 비어 있으면 해당 meta 태그는 렌더되지 않는다.
 */
export const GOOGLE_SITE_VERIFICATION = ''
export const NAVER_SITE_VERIFICATION = ''
