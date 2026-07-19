'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { getUserProfile, type UserProfileResponseDto } from '@/lib/api'
import { JOB_API_TO_LABEL } from '@/app/_utils/projectConstants'
import { UserInfoCard } from '@/app/mypage/_components/UserInfoCard'
import { ProfileForm } from '@/app/mypage/_components/ProfileForm'

export default function UserProfilePage() {
  const { userId } = useParams<{ userId: string }>()
  const [profile, setProfile] = useState<UserProfileResponseDto | null>(null)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    getUserProfile(userId)
      .then(setProfile)
      .catch(() => setNotFound(true))
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

  return (
    <main className="min-h-screen bg-neutral-99">
      <div className="mx-auto max-w-[1200px] pt-10 pb-20">
        <h1 className="text-head0_sb_52 mb-5">프로필</h1>

        <div className="flex gap-6 items-start">
          <div className="w-90 shrink-0">
            <UserInfoCard
              name={profile.name}
              job={jobLabel}
              profileImageUrl={profile.profileImageUrl}
              projectCount={profile.joinedProjectCount}
              feedbackCount={profile.feedbackCount}
              readOnly
            />
          </div>

          <div className="flex-1 rounded-[12px] bg-white p-7">
            <ProfileForm
              initialName={profile.name}
              initialJob={jobLabel}
              initialSkills={profile.skills}
              initialLinks={profile.links}
              initialBio={profile.bio ?? ''}
              readOnly
            />
          </div>
        </div>
      </div>
    </main>
  )
}
