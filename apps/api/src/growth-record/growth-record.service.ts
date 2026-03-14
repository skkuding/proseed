import { Injectable, Logger } from '@nestjs/common'
import { RecordCategory } from '@prisma/client'
import {
  EntityNotExistException,
  ForbiddenAccessException,
  UnprocessableDataException,
} from 'src/common/exceptions/business.exception'
import { PrismaService } from '../prisma/prisma.service'
import { StorageService } from '../storage/storage.service'
import type { CreateVersionDto } from './dto/create-version.dto'

const FEEDBACK_QUESTIONS_PER_CATEGORY = { min: 1, max: 4 }

@Injectable()
export class GrowthRecordService {
  private readonly logger = new Logger(GrowthRecordService.name)

  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
  ) {}

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

    this.validateFeedbackQuestionsPerCategory(dto.feedbackQuestions)

    return this.prisma.$transaction(async (tx) => {
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
            create: dto.feedbackQuestions.map((q) => ({
              category: q.category,
              title: q.title,
              description: q.description,
              order: q.order,
              isRequired: q.isRequired ?? false,
            })),
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

      return version
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
    return { ...version, growthRecords: resolved }
  }

  private validateFeedbackQuestionsPerCategory(
    questions: { category: RecordCategory }[],
  ) {
    const counts = new Map<RecordCategory, number>()
    for (const q of questions) {
      counts.set(q.category, (counts.get(q.category) ?? 0) + 1)
    }

    for (const [category, count] of counts) {
      const { min, max } = FEEDBACK_QUESTIONS_PER_CATEGORY
      if (count < min || count > max) {
        throw new UnprocessableDataException(
          `Category '${category}' has ${count} feedback questions (allowed: ${min}~${max})`,
        )
      }
    }
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
}
