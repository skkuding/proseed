import type { ReactNode } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { TextInput } from '@/components/TextInput'

const trashBtn =
  'flex h-[46px] w-[60px] shrink-0 items-center justify-center rounded-[8px] border-[1.4px] border-CoolNeutral-50 hover:cursor-pointer hover:bg-neutral-99'

interface RepeatableFieldListProps {
  label: string
  items: string[]
  onItemChange: (index: number, value: string) => void
  onAdd: () => void
  onRemove: (index: number) => void
  maxCount: number
  readOnly: boolean
  placeholder: string
  emptyMessage: string
  maxLength?: number
  prefix?: ReactNode
  /** readOnly 모드에서 각 행의 액션 영역(w-[104px])에 렌더링할 내용. 생략하면 skills처럼 readOnly일 때 액션 영역 자체를 렌더링하지 않는다. */
  readOnlyAction?: (item: string) => ReactNode
}

export function RepeatableFieldList({
  label,
  items,
  onItemChange,
  onAdd,
  onRemove,
  maxCount,
  readOnly,
  placeholder,
  emptyMessage,
  maxLength,
  prefix,
  readOnlyAction,
}: RepeatableFieldListProps) {
  const displayItems = readOnly ? items.filter((item) => item.trim()) : items
  const isMax = items.length >= maxCount

  return (
    <div className="flex gap-10">
      <label className="flex w-20 shrink-0 text-sub2_m_18 items-center h-12">{label}</label>
      <div className="flex-1 min-w-0 flex flex-col gap-2">
        {readOnly && displayItems.length === 0 && (
          <p className="text-body1_m_16 text-neutral-80 flex items-center h-12">{emptyMessage}</p>
        )}
        {displayItems.map((item, index) => (
          <div key={index} className="flex gap-2 items-start">
            <TextInput
              value={item}
              onChange={(v) => onItemChange(index, v)}
              placeholder={placeholder}
              maxLength={maxLength}
              prefix={prefix}
              disabled={readOnly}
              className="flex-1 min-w-0"
            />
            {(!readOnly || readOnlyAction) && (
              <div className="w-[104px] shrink-0">
                {readOnly ? (
                  readOnlyAction?.(item)
                ) : index === 0 ? (
                  <Button
                    variant="outline"
                    size="md"
                    onClick={onAdd}
                    disabled={isMax}
                    className="w-full text-sub3_sb_16"
                  >
                    추가하기
                  </Button>
                ) : (
                  <button type="button" onClick={() => onRemove(index)} className={trashBtn}>
                    <Image src="/trash_fill.svg" width={20} height={20} alt="삭제" />
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
