import Image from 'next/image'

function Row({ label, done, value }: { label: string; done: boolean; value?: string }) {
  return (
    <li className="flex items-center justify-between text-body1_m_16">
      <span className="text-CoolNeutral-20">• {label}</span>
      {value !== undefined ? (
        <span className="text-[#FF754F] text-sub3_sb_16 text-right max-w-[190px] truncate">
          {value || '-'}
        </span>
      ) : done ? (
        <Image src="/check.svg" alt="완료" width={20} height={20} />
      ) : (
        <span className="text-primary-strong text-sub3_sb_16">-</span>
      )}
    </li>
  )
}

interface BasicCompletion {
  category: boolean
  type: boolean
  title: boolean
  link: boolean
  description: boolean
  status: boolean
  contactPath: boolean
}

interface ImageCompletion {
  icon: boolean
  thumbnail: boolean
  projectImages: boolean
}

interface ProjectSummaryProps {
  tab: 'basic' | 'image'
  basicDone: BasicCompletion
  imageDone: ImageCompletion
  allBasicDone: boolean
  canSubmit: boolean
  submitting: boolean
  onNext: () => void
  onSubmit: () => void
  selectedCategories: string[]
  projectType: string | null
  hasMember: boolean
}

export function ProjectSummary({
  tab,
  basicDone,
  imageDone,
  allBasicDone,
  canSubmit,
  submitting,
  onNext,
  onSubmit,
  selectedCategories,
  projectType,
  hasMember,
}: ProjectSummaryProps) {
  const categoryValue = selectedCategories.length > 0 ? selectedCategories.join(' | ') : ''
  const typeValue = projectType ?? ''

  return (
    <aside className="w-[360px] shrink-0">
      <div className="sticky top-8 flex flex-col gap-4">
        <div className="rounded-[12px] bg-white px-7 pt-7 pb-7 flex flex-col gap-5">
          <h3 className="text-title1_sb_28">프로젝트 정보 요약</h3>

          {tab === 'basic' ? (
            <ul className="flex flex-col gap-3 text-body1_m_16">
              <Row label="카테고리 설정" done={basicDone.category} value={categoryValue} />
              <Row label="프로젝트 유형" done={basicDone.type} value={typeValue} />
              <Row label="프로젝트명" done={basicDone.title} />
              <Row label="프로젝트 관련 링크" done={basicDone.link} />
              <Row label="프로젝트 설명" done={basicDone.description} />
              <Row label="프로젝트 상태" done={basicDone.status} />
              <Row label="연락 가능한 경로" done={basicDone.contactPath} />
              <Row label="함께한 팀원" done={hasMember} />
            </ul>
          ) : (
            <ul className="flex flex-col gap-3">
              <Row label="서비스 아이콘" done={imageDone.icon} />
              <Row label="썸네일 이미지" done={imageDone.thumbnail} />
              <Row label="프로젝트 이미지" done={imageDone.projectImages} />
            </ul>
          )}
        </div>

        {tab === 'basic' ? (
          <button
            type="button"
            onClick={onNext}
            disabled={!allBasicDone}
            className={`w-full h-13 rounded-[8px] text-sub3_sb_16 transition-colors ${
              allBasicDone
                ? 'bg-CoolNeutral-20 text-white hover:bg-CoolNeutral-30 cursor-pointer'
                : 'bg-neutral-200 text-CoolNeutral-60 cursor-not-allowed'
            }`}
          >
            다음 단계로 넘어가기
          </button>
        ) : (
          <button
            type="button"
            onClick={onSubmit}
            disabled={!canSubmit || submitting}
            className={`w-full h-12 rounded-xl text-sub3_sb_16 transition-colors ${
              canSubmit && !submitting
                ? 'bg-CoolNeutral-20 text-white hover:bg-CoolNeutral-30 cursor-pointer'
                : 'bg-neutral-200 text-CoolNeutral-60 cursor-not-allowed'
            }`}
          >
            {submitting ? '등록 중...' : '프로젝트 등록하기'}
          </button>
        )}
      </div>
    </aside>
  )
}
