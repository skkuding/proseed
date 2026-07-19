/**
 * JSON-LD 구조화 데이터를 <script type="application/ld+json"> 로 주입.
 * 서버 컴포넌트 — 크롤러가 초기 HTML에서 바로 읽는다.
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  // XSS 방어: 프로젝트 제목 등 유저 입력이 </script> 로 스크립트 블록을 탈출하지
  // 못하도록 '<' 를 유니코드 이스케이프로 치환한다.
  const json = JSON.stringify(data).replace(/</g, '\\u003c')
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />
}
