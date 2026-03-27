'use client'

import { useState } from 'react'
import { Link2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const JOB_OPTIONS = ['디자이너', '개발자', '기획자', 'PM/PO', '마케터', '기타']

export function ProfileForm() {
  const [name, setName] = useState('영국의행복한친칠라')
  const [job, setJob] = useState('디자이너')
  const [skills, setSkills] = useState<string[]>([''])
  const [links, setLinks] = useState<string[]>([''])
  const [bio, setBio] = useState('')

  const updateSkill = (index: number, value: string) => {
    setSkills((prev) => prev.map((s, i) => (i === index ? value.slice(0, 30) : s)))
  }

  const addSkill = () => setSkills((prev) => [...prev, ''])

  const updateLink = (index: number, value: string) => {
    setLinks((prev) => prev.map((l, i) => (i === index ? value : l)))
  }

  const addLink = () => setLinks((prev) => [...prev, ''])

  return (
    <div className="flex-1 rounded-2xl bg-white p-8">
      <h2 className="mb-8 text-title3_sb_24 text-neutral-10">내 프로필</h2>

      <div className="flex flex-col gap-4">
        {/* 이름 */}
        <div className="flex items-center gap-6">
          <label className="w-20 shrink-0 text-sub2_m_18 text-neutral-40">이름</label>
          <div className="relative flex-1">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value.slice(0, 30))}
              className="w-120 rounded-lg border border-neutral-90 px-4 py-3 pr-16 text-body3_r_16 text-neutral-10 outline-none focus:border-neutral-50"
            />
            <span className="absolute right-75 top-1/2 -translate-y-1/2 text-caption4_r_12 text-neutral-70">
              {name.length}/30
            </span>
          </div>
        </div>

        {/* 직무 */}
        <div className="flex items-center gap-6">
          <label className="w-20 shrink-0 text-sub2_m_18 text-neutral-40">직무</label>
          <div className="w-120">
            <Select value={job} onValueChange={setJob}>
              <SelectTrigger className="h-12 w-120 flex-1 rounded-lg border-neutral-90">
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
        </div>

        {/* 보유 스킬 */}
        <div className="flex items-start justify-start gap-6">
          <label className="w-20 shrink-0 pt-3 text-sub2_m_18 text-neutral-40">보유 스킬</label>
          <div className="flex flex-col gap-2">
            {skills.map((skill, index) => (
              <div key={index} className="relative">
                <input
                  type="text"
                  value={skill}
                  onChange={(e) => updateSkill(index, e.target.value)}
                  placeholder="보유 스킬을 입력해주세요"
                  className="w-120 rounded-lg border border-neutral-90 px-4 py-3 pr-16 text-body3_r_16 text-neutral-10 outline-none focus:border-neutral-50 placeholder:text-neutral-70"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-caption4_r_12 text-neutral-70">
                  {skill.length}/30
                </span>
              </div>
            ))}
          </div>
          <Button
            variant="outline"
            onClick={addSkill}
            className="h-12 shrink-0 rounded-lg border-neutral-90 px-5"
          >
            추가하기
          </Button>
        </div>

        {/* 관련 링크 */}
        <div className="flex items-start gap-6">
          <label className="w-20 shrink-0 pt-3 text-sub2_m_18 text-neutral-40">관련 링크</label>
          <div className="flex flex-col gap-2">
            {links.map((link, index) => (
              <div key={index} className="relative">
                <Link2 className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-neutral-70" />
                <input
                  type="text"
                  value={link}
                  onChange={(e) => updateLink(index, e.target.value)}
                  placeholder="관련 링크를 입력해주세요"
                  className="w-120 rounded-lg border border-neutral-90 py-3 pl-10 pr-4 text-body3_r_16 text-neutral-10 outline-none focus:border-neutral-50 placeholder:text-neutral-70"
                />
              </div>
            ))}
          </div>
          <Button
            variant="outline"
            onClick={addLink}
            className="h-12 shrink-0 rounded-lg border-neutral-90 px-5"
          >
            추가하기
          </Button>
        </div>

        {/* 자기소개 */}
        <div className="flex flex-col gap-2">
          <label className="w-20 shrink-0 pt-3 text-sub2_m_18 text-neutral-40">자기소개</label>
          <div className="relative flex-1">
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value.slice(0, 600))}
              placeholder="텍스트를 입력해주세요"
              rows={5}
              className="w-full resize-none rounded-lg border border-neutral-90 px-4 py-3 text-body3_r_16 text-neutral-10 outline-none focus:border-neutral-50 placeholder:text-neutral-70"
            />
            <span className="absolute bottom-3 right-4 text-caption4_r_12 text-neutral-70">
              {bio.length}/600
            </span>
          </div>
        </div>
      </div>

      {/* 액션 버튼 */}
      <div className="mt-8 flex justify-end gap-3">
        <Button
          variant="outline"
          className="h-12 rounded-xl border-neutral-90 px-6 text-neutral-40"
        >
          초기화하기
        </Button>
        <Button className="h-12 rounded-xl bg-neutral-10 px-6 text-white hover:bg-neutral-20">
          프로필 업데이트
        </Button>
      </div>
    </div>
  )
}
