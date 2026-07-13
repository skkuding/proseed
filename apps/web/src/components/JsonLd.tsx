/**
 * JSON-LD 구조화 데이터를 <script type="application/ld+json"> 로 주입.
 * 서버 컴포넌트 — 크롤러가 초기 HTML에서 바로 읽는다.
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
  )
}
