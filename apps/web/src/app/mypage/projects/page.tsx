'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { UserInfoCard } from '../_components/UserInfoCard'
import { SideNav } from '../_components/SideNav'
import mockUser from '@/app/_mockdata/user/user-profile.json'
import navigateProjects from '@/app/_mockdata/project-list/navigate-projects.json'

const participatedProjects = navigateProjects.slice(0, mockUser.projectCount)

export default function MyParticipatedProjects() {
  const router = useRouter()

  return (
    <main className="min-h-screen pt-10">
      <div className="w-full flex flex-col gap-10">
        <div>
          <h1 className="text-head0_sb_52 text-black">마이페이지</h1>
          <p className="mt-2 text-title6_m_20 text-CoolNeutral-40">
            프로필 정보 수정부터 계정 설정, 궁금한 점 해결까지 간편하게 확인하세요
          </p>
        </div>

        <div className="flex items-start gap-6">
          {/* 왼쪽 컬럼 */}
          <div className="flex w-85 shrink-0 flex-col gap-4">
            <UserInfoCard
              name={mockUser.name}
              email={mockUser.email}
              job={mockUser.job}
              loginProvider={mockUser.loginProvider}
              profileImageUrl={mockUser.profileImageUrl}
              projectCount={mockUser.projectCount}
              feedbackCount={mockUser.feedbackCount}
            />
            <SideNav
              activeMenu="profile"
              onMenuChange={(menu) => router.push(`/mypage?tab=${menu}`)}
            />
          </div>

          {/* 오른쪽 컬럼 */}
          <div className="flex-1 rounded-2xl bg-white p-8">
            <h2 className="mb-6 text-title3_sb_24 text-neutral-10">참여한 프로젝트</h2>
            <div className="flex flex-col gap-4">
              {participatedProjects.map((project) => (
                <div
                  key={project.id}
                  className="flex items-center gap-5 rounded-2xl border border-neutral-95 px-6 py-5"
                >
                  <Image
                    src={project.thumbnailUrl}
                    alt={project.title}
                    width={56}
                    height={56}
                    className="rounded-xl shrink-0 object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-title5_sb_22 text-neutral-10">{project.title}</p>
                    <p className="mt-1 text-body3_r_16 text-neutral-40 line-clamp-2">
                      {project.oneLineDescription}
                    </p>
                  </div>
                  <Link
                    href={`/projects/${project.id}`}
                    className="shrink-0 inline-flex items-center justify-center h-11 px-5 rounded-[8px] border border-neutral-90 text-sub3_sb_16 text-neutral-20 hover:bg-neutral-99 transition-colors"
                  >
                    바로가기
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
