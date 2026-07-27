import { Button } from '@/components/ui/button'

//백엔드 UNLOCK_COST(apps/api/src/feedback/feedback.service.ts)와 동일한 고정값
const UNLOCK_COST = 1

interface FeedbackUnlockPopoverProps {
  /** 프로젝트 팀원만 unlock 가능 — false면 티켓 여부와 무관하게 열람 불가 안내만 표시 */
  canUnlock: boolean
  ticketCount: number | null
  isUnlocking: boolean
  errorMessage: string | null
  onUnlock: () => void
}

export function FeedbackUnlockPopover({
  canUnlock,
  ticketCount,
  isUnlocking,
  errorMessage,
  onUnlock,
}: FeedbackUnlockPopoverProps) {
  if (!canUnlock) {
    return (
      <div className="w-100 bg-white rounded-[12px] shadow-[0_4px_20px_0_rgba(53,78,116,0.15)] px-6 py-5 text-center">
        <p className="text-title5_sb_20 text-CoolNeutral-30">프로젝트 팀원만 열람할 수 있어요</p>
      </div>
    )
  }

  return (
    <div className="w-100 bg-white rounded-[12px] shadow-[0_4px_20px_0_rgba(27, 29, 38, 0.08)] p-6 flex flex-col gap-3">
      <div className="flex flex-col gap-2">
        <p className="text-title5_sb_20">티켓 {UNLOCK_COST}장을 소모하여 해제하기</p>
        <p className="text-body2_m_14 text-CoolNeutral-30">
          티켓을 지불하면 피드백을 확인할 수 있어요. 티켓은 타 프로젝트에 피드백을 남기거나,
          성장기록을 작성하면 얻을 수 있습니다.
        </p>
      </div>

      <div className="flex items-center justify-between px-4 py-2 bg-neutral-99 border border-neutral-95 rounded-[6px]">
        <div className="flex items-center gap-2">
          <span className="size-1 shrink-0 rounded-full bg-neutral-30" />
          <span className="text-body2_m_14 text-neutral-30">현재 보유 티켓</span>
        </div>

        <span className="text-sub4_sb_14 text-primary-strong">{ticketCount ?? '-'}장</span>
      </div>

      {errorMessage && <p className="text-body4_r_14 text-red-500">{errorMessage}</p>}
      <div className="flex justify-end">
        <Button
          size="xs"
          onClick={onUnlock}
          disabled={isUnlocking}
          className="w-25 text-sub4_sb_14"
        >
          {isUnlocking ? '해제하는 중...' : '해제하기'}
        </Button>
      </div>
    </div>
  )
}
