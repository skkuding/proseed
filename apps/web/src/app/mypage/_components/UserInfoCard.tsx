'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

function ArrowRight() {
  return <Image src="/arrow2_right_grey.svg" alt="arrow" width={20} height={20} />
}

interface UserInfoCardProps {
  name: string
  email: string
  job: string
  loginProvider: string
  profileImageUrl: string
  projectCount: number
  feedbackCount: number
}

export function UserInfoCard({
  name,
  email,
  job,
  loginProvider,
  profileImageUrl,
  projectCount,
  feedbackCount,
}: UserInfoCardProps) {
  return (
    <div className="rounded-[12px] bg-white p-7 shadow-[0_1px_3px_rgba(27,29,38,0.06)] min-w-0 overflow-hidden">
      <div className="flex items-center gap-5">
        <Image
          src={profileImageUrl}
          alt="Profile Image"
          width={83}
          height={85}
          className="rounded-full bg-neutral-95 shrink-0"
        />
        <div className="min-w-0">
          <p className="text-title1_sb_28 truncate">{name}</p>
          <p className="text-body1__m_16 text-neutral-40 truncate">
            {loginProvider} 계정으로 로그인
          </p>
        </div>
      </div>

      <div className="my-5 h-px bg-CoolNeutral-95" />

      <div className="flex flex-col gap-3 text-body1_m_16">
        <div className="flex items-center gap-5">
          <span className="text-neutral-30 shrink-0 w-22">이메일</span>
          <span className="truncate">{email}</span>
        </div>
        <div className="flex items-center gap-5">
          <span className="text-neutral-30 shrink-0 w-22">직무 유형</span>
          <span className="truncate">{job}</span>
        </div>
        <Link
          href="/mypage/projects"
          className="flex w-full items-center gap-5 transition-colors hover:bg-CoolNeutral-99 rounded-md"
        >
          <span className="text-neutral-30 w-22">참여 프로젝트</span>
          <span>{projectCount}개</span>
          <span className="ml-auto">
            <ArrowRight />
          </span>
        </Link>
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
      </div>

      <Button className="mt-7 h-13 px-5 py-[15px] w-full rounded-[8px] bg-CoolNeutral-20 text-white! text-sub3_sb_16 hover:bg-neutral-20">
        프로필 이미지 변경
      </Button>
    </div>
  )
}
