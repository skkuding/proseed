'use client'
import Image from 'next/image'
import Link from 'next/link'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { JOB_API_TO_PERSON_LABEL } from '@/app/_utils/projectConstants'
import type { ProjectDetailResponseDto } from '@/lib/api'
import { Separator } from '@/components/ui/separator'
import { authClient } from '@/lib/auth-client'
import arrowRightGrey from '../../../../../public/arrow2_right_grey.svg'

interface ProjectMemberProps {
  members: ProjectDetailResponseDto['projectRoles']
}

export function ProjectMember({ members }: ProjectMemberProps) {
  const { data: session } = authClient.useSession()

  return (
    <div className="flex w-[396px] flex-col p-8 rounded-[16px] bg-white">
      <div className="mb-4 flex items-center gap-2">
        <div className="h-6 w-[6px] shrink-0 bg-CoolNeutral-30" />
        <h2 className="text-title3_sb_24">함께한 팀원</h2>
      </div>
      <ScrollArea className="min-h-0 flex-1">
        <div>
          {members.map((member) => {
            const isSelf = !!session && Number(session.user.id) === member.userId

            return (
              <div key={member.id}>
                <Link
                  href={isSelf ? '/mypage' : `/users/${member.userId}`}
                  className="flex items-center w-full justify-between px-3 py-5 cursor-pointer hover:bg-neutral-99 rounded-[16px]"
                >
                  <div className="flex items-center gap-3">
                    <Image
                      src={member.user.profileImageUrl}
                      alt=""
                      width={50}
                      height={50}
                      className="rounded-full"
                    />
                    <div className="flex flex-col gap-1">
                      <span className="text-sub1_sb_18">{member.user.name}</span>
                      <span className="text-body4_r_14 text-CoolNeutral-20">
                        {JOB_API_TO_PERSON_LABEL[member.role] ?? member.role}
                      </span>
                    </div>
                  </div>
                  <Image src={arrowRightGrey} alt="" width={20} height={20} />
                </Link>
                <Separator className="w-full border-CoolNeutral-30 mt-5" />
              </div>
            )
          })}
        </div>
        <ScrollBar />
      </ScrollArea>
    </div>
  )
}
