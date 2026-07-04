/**
 * 로컬 개발용 시드 데이터.
 *
 * 실행: pnpm --filter api exec prisma db seed  (재실행하려면 prisma migrate reset)
 *
 * 만드는 것:
 * - email/password 로그인 가능한 유저 6명 (비밀번호 공통: proseed123!)
 *   - lead@proseed.local      : 데모 프로젝트 Lead (Developer)
 *   - planner/designer/other@proseed.local : 팀원 (직군별 draft 권한 테스트용)
 *   - feedback1/feedback2@proseed.local    : 외부 피드백 작성자 (태그 보상 테스트용)
 * - 데모 프로젝트 1개 + 발행된 버전 1.0.0 (4개 직군 성장기록 + 피드백 질문)
 * - 피드백 제출 2건 — feedback1은 PLAN+DESIGN 다직군 답변(발행 태그 시 +5 케이스)
 * - PLAN/DESIGN draft 2건 (다음 버전 작성 중 상태)
 *
 * 로그인하려면 API가 ENABLE_DEV_LOGIN=true로 떠 있어야 한다 (better-auth email/password).
 */
import {
  JobType,
  PrismaClient,
  ProjectCategory,
  ProjectMemberRole,
  ProjectStatus,
  ProjectType,
  RecordCategory,
} from '@prisma/client'
import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'

const prisma = new PrismaClient()

export const SEED_PASSWORD = 'proseed123!'

const SEED_USERS = [
  {
    key: 'lead',
    email: 'lead@proseed.local',
    name: '데모리드',
    jobType: JobType.Developer,
    image: '/profile_avocado.svg',
  },
  {
    key: 'planner',
    email: 'planner@proseed.local',
    name: '데모기획자',
    jobType: JobType.Planner,
    image: '/profile_cake.svg',
  },
  {
    key: 'designer',
    email: 'designer@proseed.local',
    name: '데모디자이너',
    jobType: JobType.Designer,
    image: '/profile_fish.svg',
  },
  {
    key: 'other',
    email: 'other@proseed.local',
    name: '데모기타직군',
    jobType: JobType.Other,
    image: '/profile_juice.svg',
  },
  {
    key: 'feedback1',
    email: 'feedback1@proseed.local',
    name: '피드백왕수달',
    jobType: JobType.Planner,
    image: '/profile_maple.svg',
  },
  {
    key: 'feedback2',
    email: 'feedback2@proseed.local',
    name: '꼼꼼한리뷰어',
    jobType: JobType.Developer,
    image: '/profile_shrimp.svg',
  },
] as const

type SeedUserKey = (typeof SEED_USERS)[number]['key']

//시드 전용 better-auth 인스턴스 — 회원가입(비밀번호 해시)에만 사용.
//비밀번호 해시는 secret과 무관해서(scrypt+salt) 실제 서버 로그인과 호환된다.
const seedAuth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET ?? 'proseed-seed-only-secret',
  database: prismaAdapter(prisma, { provider: 'postgresql' }),
  advanced: {
    database: { generateId: 'serial' },
  },
  user: {
    fields: { image: 'profileImageUrl' },
  },
  emailAndPassword: { enabled: true },
})

async function createUsers(): Promise<Record<SeedUserKey, number>> {
  const ids = {} as Record<SeedUserKey, number>
  for (const user of SEED_USERS) {
    await seedAuth.api.signUpEmail({
      body: {
        email: user.email,
        password: SEED_PASSWORD,
        name: user.name,
        image: user.image,
      },
    })
    //온보딩 완료 상태로 만들기 (jobType이 null이면 FE가 신규 유저로 취급)
    const created = await prisma.user.update({
      where: { email: user.email },
      data: { jobType: user.jobType },
      select: { id: true },
    })
    ids[user.key] = created.id
  }
  return ids
}

async function main() {
  const alreadySeeded = await prisma.user.findUnique({
    where: { email: SEED_USERS[0].email },
    select: { id: true },
  })
  if (alreadySeeded) {
    console.log(
      '이미 시드된 DB입니다. 초기화 후 재실행: pnpm --filter api exec prisma migrate reset',
    )
    return
  }

  const users = await createUsers()

  //데모 프로젝트 + 팀 구성 (Lead 1 + 직군별 팀원 3)
  const project = await prisma.project.create({
    data: {
      title: 'Proseed 데모 프로젝트',
      createdById: users.lead,
      type: ProjectType.WEB,
      status: ProjectStatus.MVP,
      oneLineDescription: '사이드 프로젝트 성장기록·피드백 플랫폼',
      description: '시드 데이터로 생성된 데모 프로젝트입니다.',
      category: [ProjectCategory.PRODUCTIVITY],
      contactPath: 'https://open.kakao.com/proseed-demo',
      projectLink: 'https://proseed.example.com',
      iconUrl: 'seed/icon.png',
      thumbnailUrl: 'seed/thumbnail.png',
      projectRoles: {
        create: [
          {
            userId: users.lead,
            projectMemberRole: ProjectMemberRole.Lead,
            role: JobType.Developer,
          },
          {
            userId: users.planner,
            projectMemberRole: ProjectMemberRole.TeamMember,
            role: JobType.Planner,
          },
          {
            userId: users.designer,
            projectMemberRole: ProjectMemberRole.TeamMember,
            role: JobType.Designer,
          },
          {
            userId: users.other,
            projectMemberRole: ProjectMemberRole.TeamMember,
            role: JobType.Other,
          },
        ],
      },
    },
  })

  //발행된 버전 1.0.0 — 4개 직군 성장기록(고정 질문 3개씩) + 직군별 피드백 질문
  const version = await prisma.projectVersion.create({
    data: {
      projectId: project.id,
      version: '1.0.0',
      updateGoal:
        'MVP 첫 공개 — 프로젝트 등록부터 피드백 수집까지 핵심 플로우 완성',
      updateResults: [
        '프로젝트 등록/조회 플로우 완성',
        '성장기록 발행 및 피드백 질문 수집',
      ],
      releasedAt: new Date(),
      growthRecords: {
        create: Object.values(RecordCategory).map((category) => ({
          category,
          contents: {
            create: [
              {
                title: '배경 및 문제 정의',
                content: `${category} 파트: 사이드 프로젝트는 피드백을 받을 채널이 마땅치 않았습니다.`,
                isDefault: true,
              },
              {
                title: '해결 방안과 그 이유',
                content: `${category} 파트: 버전 발행과 피드백 질문을 한 플로우로 묶었습니다.`,
                isDefault: true,
              },
              {
                title: '업데이트 인사이트',
                content: `${category} 파트: 구조화된 질문이 피드백 품질을 끌어올린다는 것을 확인했습니다.`,
                isDefault: true,
              },
            ],
          },
        })),
      },
      feedbackQuestions: {
        create: [
          {
            category: RecordCategory.PLAN,
            title: '문제 정의가 공감되나요?',
            description: '',
            order: 0,
            isRequired: true,
          },
          {
            category: RecordCategory.DESIGN,
            title: '첫 화면에서 서비스 흐름이 읽히나요?',
            description: '',
            order: 1,
            isRequired: false,
          },
          {
            category: RecordCategory.DEVELOPMENT,
            title: '느리거나 에러가 난 페이지가 있었나요?',
            description: '',
            order: 2,
            isRequired: false,
          },
          {
            category: RecordCategory.GENERAL,
            title: '자유롭게 하고 싶은 말을 남겨주세요',
            description: '',
            order: 3,
            isRequired: false,
          },
        ],
      },
    },
    include: { feedbackQuestions: true },
  })

  const questionByCategory = (category: RecordCategory) => {
    const question = version.feedbackQuestions.find(
      (q) => q.category === category,
    )
    if (!question) throw new Error(`seed: ${category} question missing`)
    return question
  }

  //외부 유저 피드백 제출 — 다음 버전(1.1.0) 발행 때 태그(=채택) 대상
  //feedback1: PLAN+DESIGN 다직군 답변 → 두 직군에 동시 태그하면 +5 보상 케이스
  const submission1 = await prisma.feedbackSubmission.create({
    data: {
      projectId: project.id,
      versionId: version.id,
      userId: users.feedback1,
      oneLineReview:
        '기획 방향이 명확하고 디자인도 깔끔해요. 다음 버전이 기대됩니다.',
      feedbacks: {
        create: [
          {
            questionId: questionByCategory(RecordCategory.PLAN).id,
            content:
              '문제 정의가 공감됩니다. 초기 타겟을 조금 더 좁히면 좋겠어요.',
          },
          {
            questionId: questionByCategory(RecordCategory.DESIGN).id,
            content:
              '메인 플로우는 직관적인데 CTA 버튼 대비가 약해 눈에 덜 띕니다.',
          },
        ],
      },
    },
  })
  //feedback2: DEVELOPMENT 단일 직군 답변 → 태그 시 +3 보상 케이스
  const submission2 = await prisma.feedbackSubmission.create({
    data: {
      projectId: project.id,
      versionId: version.id,
      userId: users.feedback2,
      oneLineReview: '기능은 안정적인데 초기 로딩이 조금 느립니다.',
      feedbacks: {
        create: [
          {
            questionId: questionByCategory(RecordCategory.DEVELOPMENT).id,
            content:
              '첫 진입 시 번들 크기를 줄이면 체감 속도가 좋아질 것 같습니다.',
          },
        ],
      },
    },
  })

  //다음 버전 작성 중인 직군별 draft (팀원 자기 직군 권한 테스트용)
  await prisma.growthRecordDraft.createMany({
    data: [
      {
        projectId: project.id,
        category: RecordCategory.PLAN,
        updatedById: users.planner,
        content: {
          answers: { '배경 및 문제 정의': '1.1.0 기획 파트 초안입니다.' },
          imageKeys: [],
          taggedSubmissionIds: [],
        },
      },
      {
        projectId: project.id,
        category: RecordCategory.DESIGN,
        updatedById: users.designer,
        content: {
          answers: { '배경 및 문제 정의': '1.1.0 디자인 파트 초안입니다.' },
          imageKeys: [],
          taggedSubmissionIds: [],
        },
      },
    ],
  })

  console.log(`
✅ 시드 완료
  프로젝트: id=${project.id} (${project.title})
  발행 버전: id=${version.id} (1.0.0) — 다음 발행은 1.0.1 이상
  피드백 제출: submission1=${submission1.id} (PLAN+DESIGN, 태그 시 +5), submission2=${submission2.id} (DEVELOPMENT, 태그 시 +3)
  draft: PLAN·DESIGN 2건

  로그인 계정 (비밀번호 공통: ${SEED_PASSWORD})
    Lead   : lead@proseed.local
    팀원    : planner@ / designer@ / other@proseed.local
    외부인   : feedback1@ / feedback2@proseed.local
  ※ API를 ENABLE_DEV_LOGIN=true로 실행해야 email 로그인 가능
`)
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())
