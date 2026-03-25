import { Injectable, Logger } from '@nestjs/common'
import { RecordCategory } from '@prisma/client'
import { FEEDBACK_TEMPLATES } from './feedback-template.constant'
import {
  ConflictFoundException,
  DuplicateFoundException,
  EntityNotExistException,
  ForbiddenAccessException,
} from 'src/common/exceptions/business.exception'
import { PrismaService } from '../prisma/prisma.service'
import { StorageService } from '../storage/storage.service'
import type { CreateVersionDto } from './dto/create-version.dto'

const FEEDBACK_CATEGORIES: RecordCategory[] = [
  RecordCategory.PLAN,
  RecordCategory.DESIGN,
  RecordCategory.DEVELOPMENT,
  RecordCategory.GENERAL,
]

@Injectable()
export class GrowthRecordService {
  private readonly logger = new Logger(GrowthRecordService.name)

  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
  ) {}

  getFeedbackTemplates() {
    return FEEDBACK_TEMPLATES
  }

  /** 성장기록 + 피드백 질문 발행 및 팀원 티켓 보상 */
  async createVersion(
    userId: number,
    projectId: number,
    dto: CreateVersionDto,
  ) {
    const role = await this.prisma.projectRole.findUnique({
      where: { userId_projectId: { userId, projectId } },
    })
    if (!role) {
      throw new ForbiddenAccessException(
        'Only project members can publish versions.',
      )
    }

    const feedbackQuestionRows = FEEDBACK_CATEGORIES.flatMap((category) =>
      (dto.feedbackQuestions[category]?.context ?? []).map((title, order) => ({
        category,
        title,
        description: '',
        order,
        isRequired: false,
      })),
    )

    return this.prisma.$transaction(async (tx) => {
      // 버전명 중복 검사는 트랜잭션 내에서 수행하여 경합을 방지
      const existingVersion = await tx.projectVersion.findUnique({
        where: {
          projectId_version: {
            projectId,
            version: dto.version,
          },
        },
        select: { id: true },
      })
      if (existingVersion) {
        throw new DuplicateFoundException('ProjectVersion')
      }

      const version = await tx.projectVersion.create({
        data: {
          projectId,
          version: dto.version,
          updateGoal: dto.updateGoal,
          updateResults: dto.updateResults,
          growthRecords: {
            create: dto.growthRecords.map((record) => ({
              category: record.category,
              contents: {
                create: record.contents.map((c) => ({
                  title: c.title,
                  content: c.content,
                  isDefault: c.isDefault ?? false,
                })),
              },
              images: {
                create: (record.imageKeys ?? []).map((key, i) => ({
                  url: key,
                  order: i,
                })),
              },
            })),
          },
          feedbackQuestions: {
            create: feedbackQuestionRows,
          },
        },
        include: {
          growthRecords: { include: { contents: true, images: true } },
          feedbackQuestions: true,
        },
      })

      // 팀원 전원 티켓 +1
      const members = await tx.projectRole.findMany({
        where: { projectId },
        select: { userId: true },
      })

      if (members.length > 0) {
        await tx.user.updateMany({
          where: { id: { in: members.map((m) => m.userId) } },
          data: { ownedTicketCount: { increment: 1 } },
        })
      }

      this.logger.log(
        `Version ${version.id} published for project ${projectId}, ` +
          `${members.length} tickets granted`,
      )

      return {
        ...version,
        feedbackQuestions: this.groupFeedbackQuestions(
          version.feedbackQuestions,
        ),
      }
    })
  }

  /** 특정 버전 상세 성장기록 조회 (이미지는 presigned URL로 변환) */
  async getVersionDetail(versionId: number) {
    const version = await this.prisma.projectVersion.findUnique({
      where: { id: versionId },
      include: {
        growthRecords: {
          orderBy: { category: 'asc' },
          include: {
            contents: {
              select: { title: true, content: true, isDefault: true },
              orderBy: { isDefault: 'desc' },
            },
            images: {
              select: { url: true, order: true },
              orderBy: { order: 'asc' },
            },
          },
        },
        feedbackQuestions: {
          orderBy: { order: 'asc' },
          select: {
            id: true,
            category: true,
            title: true,
            description: true,
            order: true,
            isRequired: true,
          },
        },
      },
    })

    if (!version) {
      throw new EntityNotExistException('ProjectVersion')
    }

    // S3 key → presigned URL 변환
    const resolved = await this.resolveImageUrls(version.growthRecords)

    return {
      ...version,
      growthRecords: resolved,
      feedbackQuestions: this.groupFeedbackQuestions(version.feedbackQuestions),
    }
  }

  private groupFeedbackQuestions(
    questions: { category: RecordCategory; title: string }[],
  ): Record<RecordCategory, { context: string[] }> {
    const map = Object.fromEntries(
      FEEDBACK_CATEGORIES.map((cat) => [cat, { context: [] as string[] }]),
    ) as Record<RecordCategory, { context: string[] }>

    for (const q of questions) {
      map[q.category].context.push(q.title)
    }

    return map
  }

  private async resolveImageUrls<
    T extends { images: { url: string; order: number }[] },
  >(records: T[]): Promise<T[]> {
    const allImages = records.flatMap((r) => r.images)
    if (allImages.length === 0) return records

    const urlMap = new Map<string, string>()
    await Promise.all(
      allImages.map(async (img) => {
        const signed = await this.storage.getSignedDownloadUrl(img.url)
        urlMap.set(img.url, signed)
      }),
    )

    return records.map((record) => ({
      ...record,
      images: record.images.map((img) => ({
        ...img,
        url: urlMap.get(img.url) ?? img.url,
      })),
    }))
  }

  /** 피드백 채택 (팀원 권한) 및 조건부 티켓 보상 */
  async adoptFeedback(
    userId: number,
    projectId: number,
    versionId: number,
    feedbackId: number,
    category: RecordCategory,
  ) {
    // 1. 프로젝트 팀원 권한 확인
    const role = await this.prisma.projectRole.findUnique({
      where: { userId_projectId: { userId, projectId } },
    })
    if (!role) {
      throw new ForbiddenAccessException(
        'Only project members can adopt feedbacks.',
      )
    }

    // 2. 트랜잭션: 피드백 검증 및 채택 처리, 티켓 보상 (+3, +2, +0 방어 로직)
    const result = await this.prisma.$transaction(async (tx) => {
      // 피드백 존재 확인 및 교차 검증 (트랜잭션 내부 조회로 경합 방지)
      const feedback = await tx.feedback.findUnique({
        where: {
          id: feedbackId,
          versionId,
          version: { projectId }, // 프로젝트 ID 교차 검증
        },
        select: { id: true, isAdopted: true, userId: true },
      })
      if (!feedback) {
        throw new EntityNotExistException('Feedback')
      }

      // 중복 채택 체크
      if (feedback.isAdopted) {
        throw new ConflictFoundException('This feedback is already adopted.')
      }

      // 해당 피드백 작성자가 현재 버전에서 이미 채택받은 피드백 개수 카운트
      const adoptedCount = await tx.feedback.count({
        where: {
          versionId,
          userId: feedback.userId,
          isAdopted: true,
        },
      })

      // 로직: 0개면 +3, 1개면 +2(설계상 최대 5개 제한), 2개 이상이면 0
      let rewardAmount = 0
      if (adoptedCount === 0) rewardAmount = 3
      else if (adoptedCount === 1) rewardAmount = 2

      // 피드백 채택 상태 업데이트
      await tx.feedback.update({
        where: { id: feedbackId },
        data: {
          isAdopted: true,
          adoptedCategory: category,
        },
      })

      // 보상 티켓이 있으면 작성자에게 지급
      if (rewardAmount > 0) {
        await tx.user.update({
          where: { id: feedback.userId },
          data: { ownedTicketCount: { increment: rewardAmount } },
        })
      }

      return { rewardAmount, feedbackUserId: feedback.userId }
    })

    this.logger.log(
      `Feedback ${feedbackId} adopted for version ${versionId} by user ${userId}. ` +
        `Ticket rewarded to feedback author ${result.feedbackUserId}: +${result.rewardAmount}`,
    )

    return { success: true, rewardAmount: result.rewardAmount }
  }
}
