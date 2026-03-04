'use client'
import Image from 'next/image'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { mockProject } from '@/app/_mockdata/project-detail/project-basicdata.json'
import { Separator } from '@/components/ui/separator'

export function ProjectMember() {
  return (
    <div className="p-8 rounded-xl bg-white h-[451px] w-[396px]">
      <h2 className="mb-4 text-lg font-semibold">함께한 팀원</h2>
      <ScrollArea className="h-[348px]">
        <div>
          {mockProject.projectRoles.map((member) => (
            <div
              key={member.id}
              className="flex flex-col items-center h-[89px] justify-between px-3 py-5"
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
                  <span className="text-sub1_sb_18">{member.user.name}</span>
                </div>
                <span className="text-body4_r_14 text-gray-400">{member.role}</span>
              </div>
              <Separator className="w-full border-CoolNeutral-30 mt-5" />
            </div>
          ))}
        </div>
        <ScrollBar />
      </ScrollArea>
    </div>
  )
}
