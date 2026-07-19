'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { authClient } from '@/lib/auth-client'
import { ProfileImageModal } from './ProfileImageModal'

function ArrowRight() {
  return <Image src="/arrow2_right_grey.svg" alt="arrow" width={20} height={20} />
}

interface UserInfoCardProps {
  name: string
  email?: string
  job: string
  loginProvider?: string
  profileImageUrl: string
  projectCount: number
  feedbackCount: number
  /** 참여 프로젝트 항목이 이동할 위치 (기본값: 내 마이페이지). onProjectsClick이 있으면 무시됨 */
  projectsHref?: string
  /** 페이지 이동 대신 같은 화면 안에서 뷰를 전환하고 싶을 때 (예: 타인 프로필의 탭 전환) */
  onProjectsClick?: () => void
  /** 타인의 프로필 조회 — 이미지 변경 버튼 숨김, 작성한 피드백은 링크 없이 표시만 */
  readOnly?: boolean
}

export function UserInfoCard({
  name,
  email,
  job,
  loginProvider,
  profileImageUrl,
  projectCount,
  feedbackCount,
  projectsHref = '/mypage/projects',
  onProjectsClick,
  readOnly = false,
}: UserInfoCardProps) {
  const [isPickerOpen, setIsPickerOpen] = useState(false)
  const [localImage, setLocalImage] = useState<string | null>(null)

  const displayImage = localImage ?? profileImageUrl

  const handleConfirm = async (src: string) => {
    setLocalImage(src)
    setIsPickerOpen(false)
    try {
      await authClient.updateUser({ image: src })
    } catch (e) {
      console.error(e)
      setLocalImage(null)
    }
  }

  const providerLabel = loginProvider ? `${loginProvider} ` : '소셜 '

  return (
    <>
      <div className="rounded-[12px] bg-white p-7 shadow-[0_1px_3px_rgba(27,29,38,0.06)] min-w-0 overflow-hidden">
        <div className="flex items-center gap-5">
          {displayImage ? (
            <Image
              src={displayImage}
              alt="Profile Image"
              width={83}
              height={83}
              unoptimized
              className="rounded-full bg-neutral-95 shrink-0 size-[83px] object-cover"
            />
          ) : (
            <div className="size-[83px] rounded-full bg-CoolNeutral-90 flex items-center justify-center shrink-0">
              <span className="text-title1_sb_28 text-CoolNeutral-20">
                {name[0]?.toUpperCase() ?? '?'}
              </span>
            </div>
          )}
          <div className="min-w-0">
            <p className="text-title1_sb_28 truncate">{name}</p>
            <p className="text-body1__m_16 text-neutral-40 truncate">
              {providerLabel}계정으로 로그인
            </p>
          </div>
        </div>

        <div className="my-5 h-px bg-CoolNeutral-95" />

        <div className="flex flex-col gap-3 text-body1_m_16">
          {email && (
            <div className="flex items-center gap-5">
              <span className="text-neutral-30 shrink-0 w-22">이메일</span>
              <span className="truncate">{email}</span>
            </div>
          )}
          <div className="flex items-center gap-5">
            <span className="text-neutral-30 shrink-0 w-22">직무 유형</span>
            <span className="truncate">{job}</span>
          </div>
          {onProjectsClick ? (
            <button
              type="button"
              onClick={onProjectsClick}
              className="flex w-full items-center gap-5 transition-colors hover:bg-CoolNeutral-99 rounded-md text-left hover:cursor-pointer"
            >
              <span className="text-neutral-30 w-22">참여 프로젝트</span>
              <span>{projectCount}개</span>
              <span className="ml-auto">
                <ArrowRight />
              </span>
            </button>
          ) : (
            <Link
              href={projectsHref}
              className="flex w-full items-center gap-5 transition-colors hover:bg-CoolNeutral-99 rounded-md"
            >
              <span className="text-neutral-30 w-22">참여 프로젝트</span>
              <span>{projectCount}개</span>
              <span className="ml-auto">
                <ArrowRight />
              </span>
            </Link>
          )}
          {readOnly ? (
            <div className="flex w-full items-center gap-5">
              <span className="text-neutral-30 w-22">작성한 피드백</span>
              <span>{feedbackCount}개</span>
            </div>
          ) : (
            <Link
              href="/mypage/feedbacks"
              className="flex w-full items-center gap-5 rounded-md transition-colors hover:bg-CoolNeutral-99"
            >
              <span className="text-neutral-30 w-22">작성한 피드백</span>
              <span>{feedbackCount}개</span>
              <span className="ml-auto">
                <ArrowRight />
              </span>
            </Link>
          )}
        </div>

        {!readOnly && (
          <Button
            size="lg"
            onClick={() => setIsPickerOpen(true)}
            className="mt-7 w-full text-sub3_sb_16"
          >
            프로필 이미지 변경
          </Button>
        )}
      </div>

      {!readOnly && (
        <ProfileImageModal
          isOpen={isPickerOpen}
          currentImage={displayImage}
          onClose={() => setIsPickerOpen(false)}
          onConfirm={handleConfirm}
        />
      )}
    </>
  )
}
