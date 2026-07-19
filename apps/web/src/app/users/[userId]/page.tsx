'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { getUserProfile, getUserJoinedProjects, type UserProfileResponseDto } from '@/lib/api'
import { JOB_API_TO_LABEL } from '@/app/_utils/projectConstants'
import { UserInfoCard } from '@/app/mypage/_components/UserInfoCard'
import { ProfileForm } from '@/app/mypage/_components/ProfileForm'
import { type ParticipatedProject } from '@/app/mypage/projects/_components/ParticipatedProjectCard'
import { ParticipatedProjectsList } from '@/app/mypage/projects/_components/ParticipatedProjectsList'

type ViewTab = '기본 프로필' | '참여한 프로젝트'

export default function UserProfilePage() {
  const { userId } = useParams<{ userId: string }>()
  const [profile, setProfile] = useState<UserProfileResponseDto | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [projects, setProjects] = useState<ParticipatedProject[]>([])
  const [view, setView] = useState<ViewTab>('기본 프로필')

  useEffect(() => {
    getUserProfile(userId)
      .then(setProfile)
      .catch(() => setNotFound(true))
    getUserJoinedProjects(userId)
      .then((data) =>
        setProjects(
          data.map((project) => ({
            id: project.id,
            title: project.title,
            role: JOB_API_TO_LABEL[project.role] ?? project.role,
            description: project.oneLineDescription,
            href: `/projects/${project.id}`,
            imageUrl: project.iconUrl,
          }))
        )
      )
      .catch(() => setProjects([]))
  }, [userId])

  if (notFound) {
    return (
      <main className="min-h-screen bg-neutral-99 flex items-center justify-center">
        <p className="text-body2_r_18 text-CoolNeutral-30">사용자를 찾을 수 없습니다.</p>
      </main>
    )
  }

  if (!profile) {
    return (
      <main className="min-h-screen bg-neutral-99 flex items-center justify-center">
        <p className="text-body2_r_18 text-CoolNeutral-30">불러오는 중...</p>
      </main>
    )
  }

  const jobLabel = profile.jobType ? (JOB_API_TO_LABEL[profile.jobType] ?? profile.jobType) : '-'
  const loginProvider = profile.accounts[0]?.providerId

  return (
    <main className="min-h-screen bg-neutral-99">
      <div className="mx-auto max-w-[1200px] pt-10 pb-20">
        <h1 className="text-head0_sb_52 mb-5">프로필</h1>

        <div className="flex gap-6 items-start">
          <div className="w-90 shrink-0">
            <UserInfoCard
              name={profile.name}
              email={profile.email}
              job={jobLabel}
              loginProvider={loginProvider}
              profileImageUrl={profile.profileImageUrl}
              projectCount={profile.joinedProjectCount}
              feedbackCount={profile.feedbackCount}
              onProjectsClick={() => setView('참여한 프로젝트')}
              readOnly
            />
          </div>

          <div className="flex-1">
            {view === '기본 프로필' ? (
              <div className="rounded-[12px] bg-white p-7">
                <ProfileForm
                  initialName={profile.name}
                  initialJob={jobLabel}
                  initialSkills={profile.skills}
                  initialLinks={profile.links}
                  initialBio={profile.bio ?? ''}
                  readOnly
                />
              </div>
            ) : (
              <div className="rounded-[12px] bg-white px-9 py-10 shadow-[0_1px_3px_rgba(27,29,38,0.06)]">
                <ParticipatedProjectsList projects={projects} showJoinCta={false} />
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
