import { Skeleton } from '@/components/ui/skeleton'
import { ScrollToTop } from '../_components/ScrollToTop'

export default function ProjectDetailLoading() {
  return (
    <div className="w-full mt-5">
      {/* 실제 콘텐츠(layout.tsx)는 프로젝트 조회가 끝나야 마운트되므로, 그 사이 보여지는
          이 스켈레톤 단계에서도 스크롤을 맨 위로 되돌려둔다 — 안 그러면 API 응답이 느릴 때
          (주로 프로덕션) 스켈레톤이 이전 페이지의 스크롤 위치(성장기록 부근)에 걸린 채 노출된다. */}
      <ScrollToTop />
      {/* 이미지 캐러셀 */}
      <Skeleton className="h-[474px] w-[826px] rounded-xl" />

      {/* 본문 */}
      <section className="mt-5 flex justify-between gap-4">
        {/* 왼쪽 - 프로젝트 설명 */}
        <div className="rounded-[16px] bg-white p-8 w-[944px] min-h-[451px] flex items-start gap-5">
          <Skeleton className="w-20 h-20 shrink-0 rounded-lg" />
          <div className="flex flex-col w-full gap-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-9 w-72" />
            <Skeleton className="h-5 w-full max-w-[520px]" />
            <div className="mt-2 flex gap-3">
              <Skeleton className="h-[60px] w-full max-w-[384px] rounded-xl" />
              <Skeleton className="h-[60px] w-full max-w-[384px] rounded-xl" />
            </div>
            <div className="mt-6 flex flex-col gap-3">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </div>
        </div>

        {/* 오른쪽 - 함께한 팀원 */}
        <div className="p-8 rounded-[16px] bg-white min-h-[451px] w-[396px]">
          <Skeleton className="mb-4 h-6 w-24" />
          <div className="flex flex-col gap-5">
            {Array.from({ length: 3 }).map((_, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <Skeleton className="size-[50px] rounded-full" />
                <div className="flex flex-col gap-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-3 w-14" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 탭 영역 */}
      <div className="flex flex-col bg-white w-full px-8 py-7 rounded-[16px] mt-6 gap-6">
        <div className="flex gap-6">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-20" />
        </div>
        <Skeleton className="h-40 w-full" />
      </div>
    </div>
  )
}
