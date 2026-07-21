'use client'

import {
  FeedbackAdoptionFilterButton,
  type FeedbackAdoptionFilter,
} from '@/components/FeedbackAdoptionFilterButton'
import { FeedbackSortDropdown } from './FeedbackSortDropdown'

export type FilterMode = FeedbackAdoptionFilter
export type SortValue = 'latest' | 'oldest'

interface FeedbackFilterSortPanelProps {
  filterMode: FilterMode
  sort: SortValue
  onApplyFilter: (mode: FilterMode) => void
  onChangeSort: (value: SortValue) => void
}

export function FeedbackFilterSortPanel({
  filterMode,
  sort,
  onApplyFilter,
  onChangeSort,
}: FeedbackFilterSortPanelProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <FeedbackAdoptionFilterButton value={filterMode} onApply={onApplyFilter} />
      <FeedbackSortDropdown sort={sort} onChange={onChangeSort} />
    </div>
  )
}
