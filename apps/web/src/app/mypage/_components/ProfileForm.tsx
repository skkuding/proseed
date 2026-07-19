'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TextInput } from '@/components/TextInput'
import { authClient } from '@/lib/auth-client'
import { JOB_TABS, JOB_TO_API, type JobTab } from '@/app/_utils/projectConstants'
import { useAuthStore } from '@/store/authStore'
import { BASE as API_URL, updateMyProfile } from '@/lib/api'
import { trackEvent } from '@/lib/analytics'

const JOB_OPTIONS = JOB_TABS

const MAX_SKILLS = 10
const MAX_LINKS = 3

interface ProfileFormProps {
  initialName: string
  initialJob: string
  initialSkills?: string[]
  initialLinks?: string[]
  initialBio?: string
  onJobChange?: (job: string) => void
  /** 타인의 프로필을 조회만 할 때 — 편집 UI(재생성/직무 변경/추가·삭제/저장) 전부 숨김 */
  readOnly?: boolean
}

export function ProfileForm({
  initialName,
  initialJob,
  initialSkills = [''],
  initialLinks = [''],
  initialBio = '',
  onJobChange,
  readOnly = false,
}: ProfileFormProps) {
  const [name, setName] = useState(initialName)
  const [job, setJob] = useState(initialJob)
  const [jobOpen, setJobOpen] = useState(false)
  const [skills, setSkills] = useState<string[]>(initialSkills.length > 0 ? initialSkills : [''])
  const [links, setLinks] = useState<string[]>(initialLinks.length > 0 ? initialLinks : [''])
  const [bio, setBio] = useState(initialBio)
  const [isSaving, setIsSaving] = useState(false)
  const [savedOk, setSavedOk] = useState(false)
  const [isRegenerating, setIsRegenerating] = useState(false)
  const jobRef = useRef<HTMLDivElement>(null)

  const handleRegenerate = async () => {
    setIsRegenerating(true)
    try {
      const res = await fetch(`${API_URL}/user/nickname`, { credentials: 'include' })
      const data = await res.json()
      setName(data.nickname)
    } catch (e) {
      console.error(e)
    } finally {
      setIsRegenerating(false)
    }
  }

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (jobRef.current && !jobRef.current.contains(e.target as Node)) {
        setJobOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const updateSkill = (index: number, value: string) =>
    setSkills((prev) => prev.map((s, i) => (i === index ? value : s)))

  const addSkill = () => {
    if (skills.length >= MAX_SKILLS) return
    setSkills((prev) => [...prev, ''])
  }

  const removeSkill = (index: number) => setSkills((prev) => prev.filter((_, i) => i !== index))

  const updateLink = (index: number, value: string) =>
    setLinks((prev) => prev.map((l, i) => (i === index ? value : l)))

  const addLink = () => {
    if (links.length >= MAX_LINKS) return
    setLinks((prev) => [...prev, ''])
  }

  const removeLink = (index: number) => setLinks((prev) => prev.filter((_, i) => i !== index))

  const handleReset = () => {
    setName(initialName)
    setJob(initialJob)
    setSkills(initialSkills.length > 0 ? initialSkills : [''])
    setLinks(initialLinks.length > 0 ? initialLinks : [''])
    setBio(initialBio)
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await authClient.updateUser({ name })
      if (job && JOB_TO_API[job]) {
        await fetch(`${API_URL}/user/onboarding`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ jobType: JOB_TO_API[job], nickname: name }),
        })
        useAuthStore.getState().setJobType(job as JobTab)
      }
      await updateMyProfile({
        skills: skills.map((s) => s.trim()).filter(Boolean),
        links: links.map((l) => l.trim()).filter(Boolean),
        bio,
      })
      trackEvent('profile_updated', {})
      onJobChange?.(job)
      setSavedOk(true)
      setTimeout(() => setSavedOk(false), 2000)
    } catch (e) {
      console.error(e)
    } finally {
      setIsSaving(false)
    }
  }

  const isSkillsMax = skills.length >= MAX_SKILLS
  const isLinksMax = links.length >= MAX_LINKS
  const displaySkills = readOnly ? skills.filter((s) => s.trim()) : skills
  const displayLinks = readOnly ? links.filter((l) => l.trim()) : links

  const trashBtn =
    'flex h-[46px] w-[60px] shrink-0 items-center justify-center rounded-[8px] border-[1.4px] border-CoolNeutral-50 hover:cursor-pointer hover:bg-neutral-99'

  return (
    <div className="flex flex-col gap-7">
      <span className="text-head3_sb_36">{readOnly ? '기본 프로필' : '내 프로필'}</span>

      <div className="flex flex-col gap-4 justify-center">
        {/* 이름 */}
        <div className="flex gap-10 items-center">
          <label className="w-20 shrink-0 text-sub2_m_18">이름</label>
          <div className="flex flex-1 min-w-0 items-center gap-2">
            <TextInput
              value={name}
              onChange={setName}
              placeholder="이름을 입력해주세요"
              maxLength={30}
              disabled={readOnly}
              suffix={
                readOnly ? undefined : (
                  <button
                    type="button"
                    onClick={handleRegenerate}
                    disabled={isRegenerating}
                    className="text-neutral-40 transition-colors hover:cursor-pointer hover:text-CoolNeutral-20 disabled:opacity-40"
                    aria-label="이름 재생성"
                  >
                    <RotateCcw className={`size-5 ${isRegenerating ? 'animate-spin' : ''}`} />
                  </button>
                )
              }
              className="flex-1 min-w-0"
            />
            {!readOnly && <div className="w-[104px] shrink-0" />}
          </div>
        </div>

        {/* 직무 */}
        <div className="flex gap-10 items-center">
          <label className="w-20 shrink-0 text-sub2_m_18">직무</label>
          <div className="flex flex-1 min-w-0 items-center gap-2">
            <div className="relative flex-1 min-w-0" ref={jobRef}>
              <button
                type="button"
                onClick={() => !readOnly && setJobOpen((prev) => !prev)}
                disabled={readOnly}
                className={`flex w-full items-center justify-between rounded-[8px] border border-neutral-95 px-4 py-3 ${readOnly ? 'bg-neutral-99 cursor-default' : ''}`}
              >
                <span
                  className={`text-body1_m_16 ${job ? 'text-CoolNeutral-20' : 'text-neutral-80'}`}
                >
                  {job || '직무를 선택해주세요'}
                </span>
                {!readOnly && (
                  <Image
                    src="/arrow2_down.svg"
                    width={24}
                    height={24}
                    alt=""
                    className={`shrink-0 transition-transform duration-200 ${jobOpen ? 'rotate-180' : ''}`}
                  />
                )}
              </button>
              {jobOpen && !readOnly && (
                <div className="absolute left-0 top-full z-20 mt-1 w-full overflow-hidden rounded-[8px] border border-neutral-95 bg-white shadow-md">
                  {JOB_OPTIONS.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => {
                        setJob(option)
                        setJobOpen(false)
                      }}
                      className="w-full px-4 py-3 text-left text-body1_m_16 text-CoolNeutral-20 transition-colors hover:bg-neutral-99"
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {!readOnly && <div className="w-[104px] shrink-0" />}
          </div>
        </div>

        {/* 보유 스킬 */}
        <div className="flex gap-10">
          <label className="flex w-20 shrink-0 text-sub2_m_18 items-center h-12">보유 스킬</label>
          <div className="flex-1 min-w-0 flex flex-col gap-2">
            {readOnly && displaySkills.length === 0 && (
              <p className="text-body1_m_16 text-neutral-80 flex items-center h-12">
                등록된 스킬이 없습니다
              </p>
            )}
            {displaySkills.map((skill, index) => (
              <div key={index} className="flex gap-2 items-start">
                <TextInput
                  value={skill}
                  onChange={(v) => updateSkill(index, v)}
                  placeholder="보유 스킬을 입력해주세요"
                  maxLength={30}
                  disabled={readOnly}
                  className="flex-1 min-w-0"
                />
                {!readOnly && (
                  <div className="w-[104px] shrink-0">
                    {index === 0 ? (
                      <Button
                        variant="outline"
                        size="md"
                        onClick={addSkill}
                        disabled={isSkillsMax}
                        className="w-full text-sub3_sb_16"
                      >
                        추가하기
                      </Button>
                    ) : (
                      <button type="button" onClick={() => removeSkill(index)} className={trashBtn}>
                        <Image src="/trash_fill.svg" width={20} height={20} alt="삭제" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 관련 링크 */}
        <div className="flex gap-10">
          <label className="flex w-20 shrink-0 text-sub2_m_18 items-center h-12">관련 링크</label>
          <div className="flex-1 min-w-0 flex flex-col gap-2">
            {readOnly && displayLinks.length === 0 && (
              <p className="text-body1_m_16 text-neutral-80 flex items-center h-12">
                등록된 링크가 없습니다
              </p>
            )}
            {displayLinks.map((link, index) => (
              <div key={index} className="flex gap-2 items-start">
                <TextInput
                  value={link}
                  onChange={(v) => updateLink(index, v)}
                  placeholder="관련 링크를 입력해주세요"
                  prefix={<Image src="/link.svg" alt="link" height={24} width={24} />}
                  disabled={readOnly}
                  className="flex-1 min-w-0"
                />
                <div className="w-[104px] shrink-0">
                  {readOnly ? (
                    <Button asChild variant="outline" size="md" className="w-full text-sub3_sb_16">
                      <a href={link} target="_blank" rel="noreferrer">
                        바로가기
                      </a>
                    </Button>
                  ) : index === 0 ? (
                    <Button
                      variant="outline"
                      size="md"
                      onClick={addLink}
                      disabled={isLinksMax}
                      className="w-full text-sub3_sb_16"
                    >
                      추가하기
                    </Button>
                  ) : (
                    <button type="button" onClick={() => removeLink(index)} className={trashBtn}>
                      <Image src="/trash_fill.svg" width={20} height={20} alt="삭제" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 자기소개 */}
        <div className="flex flex-col gap-2 py-3">
          <label className="w-20 shrink-0 text-sub2_m_18">자기소개</label>
          <div className="relative flex-1">
            <textarea
              value={bio || (readOnly ? '작성된 자기소개가 없습니다' : '')}
              onChange={(e) => setBio(e.target.value.slice(0, 600))}
              placeholder="텍스트를 입력해주세요"
              rows={5}
              disabled={readOnly}
              className={`w-full resize-none rounded-[8px] border border-neutral-95 p-4 text-body1_m_16 text-CoolNeutral-20 placeholder:text-neutral-80 outline-none focus:border-neutral-50 ${readOnly ? 'bg-neutral-99 cursor-default' : ''}`}
            />
            {!readOnly && (
              <span className="absolute bottom-4 right-4 text-body1_m_16 text-CoolNeutral-20">
                {bio.length}/600
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 액션 버튼 */}
      {!readOnly && (
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="md" onClick={handleReset} className="text-sub3_sb_16">
            초기화하기
          </Button>
          <Button size="md" onClick={handleSave} disabled={isSaving} className="text-sub3_sb_16">
            {isSaving ? '저장 중...' : savedOk ? '저장 완료' : '프로필 업데이트'}
          </Button>
        </div>
      )}
    </div>
  )
}
