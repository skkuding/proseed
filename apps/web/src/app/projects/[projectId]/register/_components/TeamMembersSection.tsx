'use client'

import { useState } from 'react'
import Image from 'next/image'
import { toast } from 'sonner'
import { JOB_TABS, type JobTab, type Member } from './constants'
import { MemberDeleteModal } from '@/components/MemberDeleteModal'
import projectBasicData from '@/app/_mockdata/project-detail/project-basicdata.json'

type SearchResult = { name: string; email: string; ownRole: string; profileImageUrl: string }

const MOCK_USERS: SearchResult[] = projectBasicData.mockProject.projectRoles.map((r) => ({
  name: r.user.name,
  email: r.user.email,
  ownRole: r.user.ownRole,
  profileImageUrl: r.user.profileImageUrl,
}))

interface TeamMembersSectionProps {
  memberTab: JobTab
  onMemberTabChange: (v: JobTab) => void
  memberEmail: string
  onMemberEmailChange: (v: string) => void
  members: Member[]
  onAddMember: (member: { name: string; ownRole: string; profileImageUrl: string }) => void
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
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Member | null>(null)
  const tabMembers = members.filter((m) => m.role === memberTab)

  const handleSearch = () => {
    const email = memberEmail.trim()
    if (!email) return
    const found = MOCK_USERS.find((u) => u.email === email)
    if (!found) {
      toast.error('해당 이메일로 가입된 사용자를 찾을 수 없습니다.')
      setSearchResult(null)
      return
    }
    setSearchResult(found)
  }

  const handleAdd = () => {
    if (!searchResult) return
    if (members.some((m) => m.email === searchResult.email)) {
      toast.error('이미 추가된 팀원입니다.')
      return
    }
    onAddMember({
      name: searchResult.name,
      ownRole: searchResult.ownRole,
      profileImageUrl: searchResult.profileImageUrl,
    })
    setSearchResult(null)
  }

  return (
    <section className="rounded-[12px] bg-white p-7 flex flex-col gap-6">
      <div className="flex justify-between items-start">
        <div className="flex flex-col justify-start gap-1">
          <div className="flex items-center gap-2">
            <h2 className="text-title1_sb_28">함께한 팀원</h2>
            <span className="text-CoolNeutral-40 text-caption1_m_16 bg-neutral-99 rounded-[4px] px-2 py-1">
              선택
            </span>
          </div>

          <p className="text-body3_r_16 text-CoolNeutral-30">
            프로젝트에 함께 참여한 팀원을 등록해주세요
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
            onChange={(e) => {
              onMemberEmailChange(e.target.value)
              setSearchResult(null)
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSearch()
            }}
            placeholder="이메일로 함께한 팀원을 찾아보세요"
            className="flex-1 text-body3_r_16 text-CoolNeutral-20 placeholder:text-neutral-80 outline-none bg-transparent"
          />
          <button type="button" onClick={handleSearch} className="hover:cursor-pointer">
            <Image src="/search.svg" alt="search" width={24} height={24} />
          </button>
        </div>

        {searchResult && (
          <div className="flex items-center justify-between px-4 py-3 rounded-[8px] border border-neutral-95">
            <div className="flex items-center gap-3">
              <div className="relative size-10 rounded-full overflow-hidden bg-neutral-90">
                <Image
                  src={searchResult.profileImageUrl}
                  alt={searchResult.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-body2_m_14 text-CoolNeutral-20">{searchResult.name}</span>
                <span className="text-caption1_m_13 text-CoolNeutral-50">
                  {searchResult.ownRole}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleAdd}
              className="h-10 px-3 py-[10px] rounded-[8px] bg-CoolNeutral-20 text-white text-sub4_sb_14 hover:cursor-pointer"
            >
              {memberTab}로 추가하기
            </button>
          </div>
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
                  <span className="text-sub3_sb_16 text-CoolNeutral-20">
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
