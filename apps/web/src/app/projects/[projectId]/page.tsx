import Image from 'next/image'
import { mockProject } from '@/app/_mockdata/project-detail/project-basicdata.json'
import { ProjectImageCarousel } from './_components/ProjectImageCarousel'

export default function ProjectDetailPage() {
  return (
    <div className="w-full mt-5">
      {/* 이미지 영역 */}
      <ProjectImageCarousel
        images={[mockProject.thumbnailUrl, ...mockProject.images.map((i) => i.url)]}
      />

      {/* 본문 */}
      <section className="mt-5 flex flex-col gap-6">
        <div className="flex justify-between">
          {/* 왼쪽 */}
          <div className="rounded-xl bg-white p-8 w-[944px] h-[451px]">
            <h1 className="text-2xl font-bold">{mockProject.title}</h1>
            <p className="mt-2 text-gray-600">{mockProject.oneLineDescription}</p>

            <div className="mt-6">
              <h2 className="mb-2 text-lg font-semibold">프로젝트 설명</h2>
              <p className="text-gray-700 leading-relaxed">{mockProject.description}</p>
            </div>
          </div>

          {/* 오른쪽 - 함께한 팀원 */}
          <aside className="rounded-xl bg-white p-8 h-[451px] w-[396px]">
            <h2 className="mb-4 text-lg font-semibold">함께한 팀원</h2>

            <div className="max-h-90 space-y-3 overflow-y-auto pr-1">
              {mockProject.projectRoles.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between rounded-lg px-3 py-2 hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    <Image
                      src={member.user.profileImageUrl}
                      alt=""
                      width={36}
                      height={36}
                      className="rounded-full"
                    />
                    <span className="font-medium">{member.user.name}</span>
                  </div>
                  <span className="text-sm text-gray-400">{member.role}</span>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </section>
    </div>
  )
}
