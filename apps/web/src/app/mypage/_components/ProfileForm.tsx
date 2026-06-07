'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { TextInput } from '@/components/TextInput'
import { authClient } from '@/lib/auth-client'

const API_URL = process.env.NEXT_PUBLIC_API_URL

const JOB_OPTIONS = ['디자이너', '개발자', '기획', '기타']

const JOB_TO_ENUM: Record<string, string> = {
  디자이너: 'Designer',
  개발자: 'Developer',
  기획: 'Planner',
  기타: 'Other',
}

const MAX_SKILLS = 10
const MAX_LINKS = 3

interface ProfileFormProps {
  initialName: string
  initialJob: string
  initialSkills?: string[]
  initialLinks?: string[]
  initialBio?: string
}

export function ProfileForm({
  initialName,
  initialJob,
  initialSkills = [''],
  initialLinks = [''],
  initialBio = '',
}: ProfileFormProps) {
  const [name, setName] = useState(initialName)
  const [job, setJob] = useState(initialJob)
  const [skills, setSkills] = useState<string[]>(initialSkills.length > 0 ? initialSkills : [''])
  const [links, setLinks] = useState<string[]>(initialLinks.length > 0 ? initialLinks : [''])
  const [bio, setBio] = useState(initialBio)
  const [isSaving, setIsSaving] = useState(false)

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
      if (job && JOB_TO_ENUM[job]) {
        await fetch(`${API_URL}/user/onboarding`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ jobType: JOB_TO_ENUM[job], nickname: name }),
        })
      }
    } catch (e) {
      console.error(e)
    } finally {
      setIsSaving(false)
    }
  }

  const isSkillsMax = skills.length >= MAX_SKILLS
  const isLinksMax = links.length >= MAX_LINKS

  const addBtnBase = 'h-12 shrink-0 rounded-[8px] px-5 py-[13px] text-sub3_sb_16'
  const addBtnEnabled = 'border-CoolNeutral-50 text-CoolNeutral-20 hover:cursor-pointer'
  const addBtnDisabled =
    'bg-neutral-95 text-neutral-70 border-neutral-90 cursor-not-allowed hover:bg-neutral-95'

  const trashBtn =
    'flex h-12 min-w-[60px] shrink-0 items-center justify-center rounded-[8px] border border-neutral-90 hover:cursor-pointer hover:bg-neutral-99'

  return (
    <div className="flex-1 min-w-0 rounded-2xl bg-white p-10 flex flex-col gap-7 shadow-[0_4px_12px_0_rgba(27,29,38,0.06)]">
      <span className="text-head3_sb_36">내 프로필</span>

      <div className="flex flex-col gap-4 justify-center">
        {/* 이름 */}
        <div className="flex gap-10 items-center">
          <label className="w-20 shrink-0 text-sub2_m_18">이름</label>
          <TextInput
            value={name}
            onChange={setName}
            placeholder="이름을 입력해주세요"
            maxLength={30}
            className="w-full md:w-[480px] md:flex-none"
          />
        </div>

        {/* 직무 */}
        <div className="flex gap-10 items-center">
          <label className="w-20 shrink-0 text-sub2_m_18">직무</label>
          <Select value={job} onValueChange={setJob}>
            <SelectTrigger className="h-auto w-full rounded-[8px] border-neutral-95 px-4 py-3 md:w-[480px] md:flex-none">
              <SelectValue placeholder="직무를 선택해주세요" />
            </SelectTrigger>
            <SelectContent>
              {JOB_OPTIONS.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* 보유 스킬 */}
        <div className="flex gap-3">
          <label className="flex w-20 shrink-0 text-sub2_m_18 items-center h-12">보유 스킬</label>
          <div className="ml-7 w-full flex flex-col gap-2 md:w-[480px]">
            {skills.map((skill, index) => (
              <TextInput
                key={index}
                value={skill}
                onChange={(v) => updateSkill(index, v)}
                placeholder="보유 스킬을 입력해주세요"
                maxLength={30}
              />
            ))}
          </div>
          <div className="flex flex-col gap-2">
            <Button
              variant="outline"
              onClick={addSkill}
              disabled={isSkillsMax}
              className={`${addBtnBase} ${isSkillsMax ? addBtnDisabled : addBtnEnabled}`}
            >
              추가하기
            </Button>
            {skills.slice(1).map((_, i) => (
              <button key={i} type="button" onClick={() => removeSkill(i + 1)} className={trashBtn}>
                <Image src="/trash_fill.svg" width={20} height={20} alt="삭제" />
              </button>
            ))}
          </div>
        </div>

        {/* 관련 링크 */}
        <div className="flex gap-3">
          <label className="flex w-20 shrink-0 text-sub2_m_18 md:h-12 md:items-center">
            관련 링크
          </label>
          <div className="ml-7 w-full flex flex-col gap-2 md:w-[480px]">
            {links.map((link, index) => (
              <TextInput
                key={index}
                value={link}
                onChange={(v) => updateLink(index, v)}
                placeholder="관련 링크를 입력해주세요"
                prefix={<Image src="/link.svg" alt="link" height={24} width={24} />}
              />
            ))}
          </div>
          <div className="flex flex-col gap-2">
            <Button
              variant="outline"
              onClick={addLink}
              disabled={isLinksMax}
              className={`${addBtnBase} ${isLinksMax ? addBtnDisabled : addBtnEnabled}`}
            >
              추가하기
            </Button>
            {links.slice(1).map((_, i) => (
              <button key={i} type="button" onClick={() => removeLink(i + 1)} className={trashBtn}>
                <Image src="/trash_fill.svg" width={20} height={20} alt="삭제" />
              </button>
            ))}
          </div>
        </div>

        {/* 자기소개 */}
        <div className="flex flex-col gap-2 py-3">
          <label className="w-20 shrink-0 text-sub2_m_18">자기소개</label>
          <div className="relative flex-1">
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value.slice(0, 600))}
              placeholder="텍스트를 입력해주세요"
              rows={5}
              className="w-full resize-none rounded-[8px] border border-neutral-95 p-4 text-body1_m_16 text-CoolNeutral-20 placeholder:text-neutral-80 outline-none focus:border-neutral-50"
            />
            <span className="absolute bottom-4 right-4 text-body1_m_16 text-CoolNeutral-20">
              {bio.length}/600
            </span>
          </div>
        </div>
      </div>

      {/* 액션 버튼 */}
      <div className="flex justify-end gap-2">
        <Button
          variant="outline"
          onClick={handleReset}
          className="h-12 rounded-[8px] border-CoolNeutral-50 px-5 py-[13px] text-sub3_sb_16 text-CoolNeutral-20 hover:cursor-pointer"
        >
          초기화하기
        </Button>
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="h-12 rounded-[8px] bg-CoolNeutral-20 px-5 py-[13px] text-sub3_sb_16 text-white hover:cursor-pointer disabled:opacity-60"
        >
          {isSaving ? '저장 중...' : '프로필 업데이트'}
        </Button>
      </div>
    </div>
  )
}
