import Link from 'next/link'
import Image from 'next/image'
import { CATEGORY_LABELS, STATUS_LABELS } from '@/app/_utils/projectConstants'
import type { ProjectDetailResponseDto } from '@/lib/api'
import { Button } from '@/components/ui/button'
import bullet from '../../../../../public/bullet_cool40.svg'
import { Separator } from '@/components/ui/separator'

interface ProjectDescriptionProps {
  project: ProjectDetailResponseDto
}

export function ProjectDescription({ project }: ProjectDescriptionProps) {
  return (
    <div className="rounded-[16px] bg-white p-8 w-[944px] min-h-[451px] flex items-start gap-5">
      <Image
        src={project.iconUrl}
        alt=""
        width={80}
        height={80}
        className="w-20 h-20 shrink-0 rounded-lg object-cover"
      />
      <div className="flex flex-col w-full">
        <p className="text-body1_m_16 text-CoolNeutral-30">
          {project.category.map((category, idx) => (
            <span key={idx}>
              {CATEGORY_LABELS[category] ?? category}
              {idx < project.category.length - 1 && ' · '}
            </span>
          ))}
        </p>
        <div className="flex justify-between">
          <div className="flex gap-2">
            <h1 className="text-head3_sb_36">{project.title}</h1>
            <div className="h-[33px] px-2 py-1 self-center rounded-[4px] bg-neutral-99 text-CoolNeutral-50 text-sub2_m_18">
              {project.type}
            </div>
          </div>
          <div className="flex gap-3">
            {/* mvp: no bookmark */}
            {/* <Button className="h-12 w-12 rounded-full shadow-sm bg-white hover:bg-neutral-99">
                    <Image src={bookmarkline} alt="북마크" width={24} height={24} />
                  </Button> */}
            <Link href={project.projectLink} target="_blank">
              <Button className="w-[137px] h-12 rounded-md bg-CoolNeutral-20 hover:bg-CoolNeutral-30">
                <p className="text-white text-sub3_sb_16">직접 사용해보기</p>
              </Button>
            </Link>
          </div>
        </div>
        <p className="mt-4 text-CoolNeutral-40 text-sub2_m_18">{project.oneLineDescription}</p>
        <div className="mt-6 flex gap-3">
          <div className="w-full max-w-[384px] rounded-xl flex items-center justify-between bg-neutral-99 p-3 pr-4 gap-2">
            <div className="flex items-center gap-[11.5px] pl-[7.5px]">
              <Image src={bullet} alt="bullet" width={5} height={5} />
              <p className="text-body1_m_16 text-CoolNeutral-30">연락 가능한 경로</p>
            </div>
            <Link
              href={project.contactPath}
              target="_blank"
              className="text-body1_m_16 underline text-right"
            >
              {project.contactPath}
            </Link>
          </div>
          <div className="w-full max-w-[384px] rounded-xl flex items-center justify-between bg-neutral-99 p-3 pr-4 gap-2">
            <div className="flex items-center gap-[11.5px] pl-[7.5px]">
              <Image src={bullet} alt="bullet" width={5} height={5} />
              <p className="text-body1_m_16 text-CoolNeutral-30">프로젝트 진행 상황</p>
            </div>
            <p className="text-body1_m_16">{STATUS_LABELS[project.status] ?? project.status}</p>
          </div>
        </div>
        <div className="mt-10 flex flex-col gap-4">
          <div className="flex gap-2 h-7">
            <Separator orientation="vertical" className="border-4 border-CoolNeutral-30" />
            <h2 className="text-lg font-semibold">프로젝트 설명</h2>
          </div>
          <p className="text-neutral-20 leading-relaxed text-body3_r_16">{project.description}</p>
        </div>
      </div>
    </div>
  )
}
