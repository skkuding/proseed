import { type Counter, metrics } from '@opentelemetry/api'

/**
 * proseed 비즈니스 이벤트 카운터.
 *
 * 앱 자체 상태(현재 사용자 수 등)는 DB 쿼리로 보는 게 정확하다. 여기 카운터는
 * "발생 순간을 박제"해야 하는 이산 이벤트만 담는다. 예: 가입·탈퇴는 DB row가
 * 지워지면 과거 수치가 소급으로 변하므로 append-only 카운터가 진실을 보존한다.
 *
 * OTel MeterProvider 는 NodeSDK.start() 시점에 등록되므로, 카운터는 첫 이벤트가
 * 발생할 때(=런타임, start 이후) 지연 생성한다.
 */

const METER_NAME = 'proseed-business'

type BusinessCounters = {
  signups: Counter
  projectsCreated: Counter
  collaboratorInvites: Counter
  feedbacksSubmitted: Counter
  feedbacksAdopted: Counter
  growthRecordsPublished: Counter
  userWithdrawals: Counter
}

let counters: BusinessCounters | null = null

function getCounters(): BusinessCounters {
  if (!counters) {
    const meter = metrics.getMeter(METER_NAME)
    counters = {
      signups: meter.createCounter('proseed.signups', {
        description: '신규 회원 가입 수',
      }),
      projectsCreated: meter.createCounter('proseed.projects.created', {
        description: '등록된 프로젝트 수',
      }),
      collaboratorInvites: meter.createCounter('proseed.collaborator.invites', {
        description: '협업자 초대 수',
      }),
      feedbacksSubmitted: meter.createCounter('proseed.feedbacks.submitted', {
        description: '제출된 피드백 수',
      }),
      feedbacksAdopted: meter.createCounter('proseed.feedbacks.adopted', {
        description: '채택된 피드백 수',
      }),
      growthRecordsPublished: meter.createCounter(
        'proseed.growth_records.published',
        {
          description: '발행된 성장기록 버전 수',
        },
      ),
      userWithdrawals: meter.createCounter('proseed.user.withdrawals', {
        description: '회원 탈퇴 수',
      }),
    }
  }
  return counters
}

export function recordSignup(): void {
  getCounters().signups.add(1)
}

export function recordProjectCreated(projectType: string): void {
  getCounters().projectsCreated.add(1, { project_type: projectType })
}

export function recordCollaboratorInvite(role: string): void {
  getCounters().collaboratorInvites.add(1, { role })
}

export function recordFeedbackSubmitted(): void {
  getCounters().feedbacksSubmitted.add(1)
}

export function recordFeedbacksAdopted(count: number): void {
  if (count > 0) {
    getCounters().feedbacksAdopted.add(count)
  }
}

export function recordGrowthRecordPublished(): void {
  getCounters().growthRecordsPublished.add(1)
}

export function recordUserWithdrawal(): void {
  getCounters().userWithdrawals.add(1)
}
