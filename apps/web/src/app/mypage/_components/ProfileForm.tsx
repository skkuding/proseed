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

const JOB_OPTIONS = ['디자이너', '개발자', '기획', '기타']

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

  const updateSkill = (index: number, value: string) => {
    setSkills((prev) => prev.map((s, i) => (i === index ? value : s)))
  }

  const addSkill = () => setSkills((prev) => [...prev, ''])

  const updateLink = (index: number, value: string) => {
    setLinks((prev) => prev.map((l, i) => (i === index ? value : l)))
  }

  const addLink = () => setLinks((prev) => [...prev, ''])

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
              <SelectValue />
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
          <label className=" flex w-20 shrink-0 text-sub2_m_18 items-center h-12 items-center">
            보유 스킬
          </label>
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
          <Button
            variant="outline"
            onClick={addSkill}
            className="h-12 shrink-0 self-start rounded-[8px] border-CoolNeutral-50 px-5 py-[13px] text-sub3_sb_16 text-CoolNeutral-20 hover:cursor-pointer"
          >
            추가하기
          </Button>
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
          <Button
            variant="outline"
            onClick={addLink}
            className="h-12 shrink-0 self-start rounded-[8px] border-CoolNeutral-50 px-5 py-[13px] text-sub3_sb_16 text-CoolNeutral-20 hover:cursor-pointer"
          >
            추가하기
          </Button>
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
          className="h-12 rounded-[8px] border-CoolNeutral-50 px-5 py-[13px] text-sub3_sb_16 text-CoolNeutral-20 hover:cursor-pointer"
        >
          초기화하기
        </Button>
        <Button className="h-12 rounded-[8px] bg-CoolNeutral-20 px-5 py-[13px] text-sub3_sb_16 text-white hover:cursor-pointer">
          프로필 업데이트
        </Button>
      </div>
    </div>
  )
}
