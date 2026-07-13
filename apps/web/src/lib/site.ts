/** 사이트 정식 도메인 — metadataBase·canonical·robots·sitemap 공용 SSOT */
export const SITE_URL = 'https://proseednow.com'

/** 사이트 기본 설명 (메타데이터·OG 공용) */
export const SITE_DESCRIPTION =
  'PROSEED는 흩어진 프로젝트 기록을 모으고, 낯선 피드백으로 성장하며, 독보적인 포트폴리오를 완성하는 공간입니다.'

/**
 * 검색엔진 색인 허용 여부 (SSOT).
 * 출시 전: false → 전체 noindex (미완성 페이지 색인 방지).
 * 출시일: true 로 플립 → 색인 허용. 커밋 히스토리에 색인 개시 시점이 남는다.
 */
export const ALLOW_INDEXING = false
