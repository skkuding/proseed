'use client'

import { FieldBadge } from '@/components/FieldBadge'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import { SearchIcon } from 'lucide-react'
import { toast } from 'sonner'
import { JOB_TABS, type JobTab, type Member } from './constants'
import { MemberDeleteModal } from '@/components/MemberDeleteModal'
import { getProfilePreviewByEmail, type ProfilePreviewResponseDto } from '@/lib/api'
import { JOB_API_TO_LABEL } from '@/app/_utils/projectConstants'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

interface TeamMembersSectionProps {
  memberTab: JobTab
  onMemberTabChange: (v: JobTab) => void
  memberEmail: string
  onMemberEmailChange: (v: string) => void
  members: Member[]
  onAddMember: (member: {
    name: string
    ownRole: string
    profileImageUrl: string
  }) => void | Promise<void>
  onRemoveMember: (email: string) => void
}

function truncateName(name: string) {
  return name.length > 8 ? name.slice(0, 7) + '...' : name
}

export function TeamMembersSection({
  memberTab,
  onMemberTabChange,
  memberEmail,
  onMemberEmailChange,
  members,
  onAddMember,
  onRemoveMember,
}: TeamMembersSectionProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Member | null>(null)
  const [preview, setPreview] = useState<ProfilePreviewResponseDto | null>(null)
  const [previewStatus, setPreviewStatus] = useState<'idle' | 'loading' | 'not-found'>('idle')
  const tabMembers = members.filter((m) => m.role === memberTab)

  useEffect(() => {
    const email = memberEmail.trim()
    setPreview(null)
    if (!EMAIL_RE.test(email)) {
      setPreviewStatus('idle')
      return
    }
    setPreviewStatus('loading')
    const timer = setTimeout(() => {
      getProfilePreviewByEmail(email)
        .then(setPreview)
        .catch(() => setPreviewStatus('not-found'))
        .then(() => setPreviewStatus((s) => (s === 'loading' ? 'idle' : s)))
    }, 400)
    return () => clearTimeout(timer)
  }, [memberEmail])

  const handleAdd = async () => {
    const email = memberEmail.trim()
    if (!email) return
    if (!EMAIL_RE.test(email)) {
      toast.error('올바른 이메일 형식이 아닙니다.')
      return
    }
    if (members.some((m) => m.email === email)) {
      toast.error('이미 추가된 팀원입니다.')
      return
    }

    setIsAdding(true)
    try {
      await onAddMember({
        name: preview?.name ?? email,
        ownRole: `${memberTab} 참여자`,
        profileImageUrl: '',
      })
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '팀원 초대에 실패했습니다.')
    } finally {
      setIsAdding(false)
    }
  }

  return (
    <section className="rounded-[12px] bg-white p-7 flex flex-col gap-6">
      <div className="flex justify-between items-start">
        <div className="flex flex-col justify-start gap-1">
          <div className="flex items-center gap-2">
            <h2 className="text-title1_sb_28">함께한 팀원</h2>
            <FieldBadge type="선택" />
          </div>

          <p className="text-body3_r_16 text-CoolNeutral-30">
            프로젝트에 함께 참여한 팀원을 이메일로 초대해주세요
          </p>
        </div>

        <div className="flex flex-wrap gap-1">
          {JOB_TABS.map((j) => (
            <button
              key={j}
              type="button"
              onClick={() => onMemberTabChange(j)}
              className={`w-25 px-4 py-3 hover:cursor-pointer rounded-[8px] text-body2_m_14 items-center transition-colors ${
                memberTab === j
                  ? 'bg-CoolNeutral-15 text-white'
                  : 'bg-neutral-99 text-black hover:bg-neutral-90'
              }`}
            >
              {j}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 rounded-[8px] border border-neutral-95 px-4 py-3">
          <Image src="/mail.svg" alt="mail" width={24} height={24} className="shrink-0" />
          <input
            type="email"
            value={memberEmail}
            onChange={(e) => onMemberEmailChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAdd()
            }}
            placeholder="이메일로 함께한 팀원을 초대해보세요"
            className="flex-1 text-body3_r_16 text-CoolNeutral-20 placeholder:text-neutral-80 outline-none bg-transparent"
          />
          <SearchIcon
            className={`size-5 shrink-0 ${previewStatus === 'loading' ? 'text-CoolNeutral-40 animate-pulse' : 'text-neutral-70'}`}
          />
        </div>

        {preview && (
          <div className="flex items-center w-full px-4 py-3 gap-3 rounded-[12px] border border-neutral-95 bg-neutral-99">
            <div className="flex items-center justify-center size-[42px] shrink-0 rounded-full bg-neutral-90 text-sub3_sb_16 text-CoolNeutral-40">
              {preview.name[0]}
            </div>
            <div className="flex flex-col flex-1 min-w-0">
              <span className="text-sub3_sb_16 text-CoolNeutral-20 truncate">{preview.name}</span>
              <span className="text-caption1_m_13 text-CoolNeutral-50">
                {preview.jobType ? JOB_API_TO_LABEL[preview.jobType] : '직군 미입력'}
              </span>
            </div>
            <button
              type="button"
              onClick={handleAdd}
              disabled={isAdding}
              className="h-10 px-3 py-[10px] rounded-[8px] bg-CoolNeutral-20 text-white text-sub4_sb_14 hover:cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
            >
              {isAdding ? '추가 중...' : `${memberTab}로 추가하기`}
            </button>
          </div>
        )}
        {previewStatus === 'not-found' && (
          <p className="text-caption1_m_13 text-[#FF754F] pl-1">
            아직 PROSEED에 가입하지 않은 이메일이에요
          </p>
        )}
      </div>

      {tabMembers.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-sub1_sb_18 text-black">{memberTab}로 추가한 팀원</p>
          <div className="flex flex-wrap gap-2">
            {tabMembers.map((m) => (
              <div
                key={m.email}
                className="flex items-center w-[225px] px-4 py-5 gap-3 rounded-[12px] border border-neutral-95 bg-neutral-99"
              >
                <div className="relative size-[42px] shrink-0 rounded-full overflow-hidden bg-neutral-90">
                  {m.profileImageUrl ? (
                    <Image
                      src={m.profileImageUrl}
                      alt={m.name ?? ''}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <span className="flex items-center justify-center w-full h-full text-sub3_sb_16 text-CoolNeutral-40">
                      {m.name?.[0]}
                    </span>
                  )}
                </div>
                <div className="flex flex-col flex-1 min-w-0">
                  <span className="text-sub3_sb_16 text-CoolNeutral-20 truncate">
                    {truncateName(m.name)}
                  </span>
                  <span className="text-caption1_m_13 text-CoolNeutral-50">{m.ownRole}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setDeleteTarget(m)}
                  className="shrink-0 hover:cursor-pointer"
                >
                  <Image src="/delete.svg" alt="삭제" width={20} height={20} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <MemberDeleteModal
        isOpen={!!deleteTarget}
        name={deleteTarget?.name ?? ''}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) onRemoveMember(deleteTarget.email)
          setDeleteTarget(null)
        }}
      />
    </section>
  )
}
