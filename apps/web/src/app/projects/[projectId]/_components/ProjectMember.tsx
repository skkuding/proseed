'use client'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { JOB_API_TO_LABEL } from '@/app/_utils/projectConstants'
import type { ProjectDetailResponseDto } from '@/lib/api'
import { Separator } from '@/components/ui/separator'
import { authClient } from '@/lib/auth-client'
import arrowRightGrey from '../../../../../public/arrow2_right_grey.svg'

interface ProjectMemberProps {
  members: ProjectDetailResponseDto['projectRoles']
}

export function ProjectMember({ members }: ProjectMemberProps) {
  const router = useRouter()
  const { data: session } = authClient.useSession()

  return (
    <div className="p-8 rounded-[16px] bg-white min-h-[451px] w-[396px]">
      <h2 className="mb-4 text-lg font-semibold">함께한 팀원</h2>
      <ScrollArea className="h-[348px]">
        <div>
          {members.map((member) => {
            // TODO: 팀원 목록엔 userId가 안 내려와서(ProjectMemberDto) 이름으로만 본인 여부를 추정 중.
            // 다른 사람 클릭 시 이동은 백엔드가 userId를 내려주면 /users/[userId]로 연결할 것 (페이지는 이미 있음).
            const isSelf = !!session && session.user.name === member.user.name

            return (
              <div
                key={member.id}
                onClick={() => {
                  if (isSelf) router.push('/mypage')
                }}
                className={`flex flex-col items-center h-[89px] justify-between px-3 py-5 ${
                  isSelf ? 'cursor-pointer hover:bg-neutral-99 rounded-[16px]' : ''
                }`}
              >
                <div className="flex items-center w-full justify-between">
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
                        {JOB_API_TO_LABEL[member.role] ?? member.role}
                      </span>
                    </div>
                  </div>
                  <Image src={arrowRightGrey} alt="" width={20} height={20} />
                </div>
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
