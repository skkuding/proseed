import { Injectable, Logger } from '@nestjs/common'
import { ProjectMemberRole, RecordCategory, type Prisma } from '@prisma/client'
import {
  ConflictFoundException,
  DuplicateFoundException,
  EntityNotExistException,
  ForbiddenAccessException,
  UnprocessableDataException,
} from 'src/common/exceptions/business.exception'
import { PrismaService } from '../prisma/prisma.service'
import { StorageService } from '../storage/storage.service'
import {
  MAX_TAGGED_FEEDBACKS_PER_CATEGORY,
  VERSION_PATTERN,
  type CreateVersionDto,
  type TaggedFeedbacksDto,
} from './dto/create-version.dto'
import { FEEDBACK_TEMPLATES } from './feedback-template.constant'

//발행 시 팀원 전원에게 지급하는 티켓
const VERSION_PUBLISH_REWARD = 1
//태그(=채택) 보상: 제출 1건 기준 +3, 같은 제출이 2개 이상 직군에서 동시 채택되면 총 +5
const ADOPTION_REWARD_SINGLE_CATEGORY = 3
const ADOPTION_REWARD_MULTI_CATEGORY = 5

type TaggedSubmissionMap = Map<number, { userId: number }>

type ParsedVersion = [major: number, minor: number, patch: number]

const parseVersion = (version: string): ParsedVersion | null => {
  if (!VERSION_PATTERN.test(version)) return null
  const [major, minor, patch] = version.split('.').map(Number)
  return [major, minor, patch]
}

const compareVersion = (a: ParsedVersion, b: ParsedVersion): number =>
  a[0] - b[0] || a[1] - b[1] || a[2] - b[2]

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

  /**
   * 성장기록 + 피드백 질문 발행 (Lead 전용)
   * - 이전 버전 피드백 태그 = 채택: 작성자에게 +3(단일 직군) / 총 +5(2개 직군 이상) 지급
   * - 발행 보상: 팀원 전원 +1
   */
  async createVersion(
    userId: number,
    projectId: number,
    dto: CreateVersionDto,
  ) {
    const role = await this.prisma.projectRole.findUnique({
      where: { userId_projectId: { userId, projectId } },
    })
    if (role?.projectMemberRole !== ProjectMemberRole.Lead) {
      throw new ForbiddenAccessException(
        'Only the project Lead can publish versions.',
      )
    }

    //직군별 태그 병합 — 같은 직군이 여러 항목으로 쪼개져 와도 한도(3)를 우회하지 못하게
    const tagsByCategory = this.mergeTaggedFeedbacks(dto.taggedFeedbacks ?? [])

    return this.prisma.$transaction(async (tx) => {
      // 버전 중복·순서 검증은 트랜잭션 내에서 수행하여 경합을 방지
      await this.assertVersionIsAhead(tx, projectId, dto.version)

      //태그 대상 검증(이 프로젝트의 미채택 제출 + 직군 일치) 및 작성자 확보
      const taggedSubmissions = await this.assertTaggable(
        tx,
        projectId,
        tagsByCategory,
      )

      const version = await tx.projectVersion.create({
        data: {
          projectId,
          version: dto.version,
          updateGoal: dto.updateGoal,
          updateResults: dto.updateResults,
          releasedAt: new Date(),
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
            create: dto.feedbackQuestions.map((q, i) => ({
              category: q.category,
              title: q.content,
              description: '',
              order: i,
              isRequired: q.isRequired ?? false,
            })),
          },
        },
        include: {
          growthRecords: { include: { contents: true, images: true } },
          feedbackQuestions: true,
        },
      })

      //태그(=채택) 기록 + 작성자 보상
      await this.adoptTaggedFeedbacks(
        tx,
        version.growthRecords,
        tagsByCategory,
        taggedSubmissions,
      )

      //발행 성공 시 해당 프로젝트의 임시저장(draft) 자동 삭제
      await tx.growthRecordDraft.deleteMany({ where: { projectId } })

      // 팀원 전원 티켓 +1
      const members = await tx.projectRole.findMany({
        where: { projectId },
        select: { userId: true },
      })

      if (members.length > 0) {
        await tx.user.updateMany({
          where: { id: { in: members.map((m) => m.userId) } },
          data: { ownedTicketCount: { increment: VERSION_PUBLISH_REWARD } },
        })
      }

      this.logger.log(
        `Version ${version.id} published for project ${projectId} by user ${userId}, ` +
          `${members.length} publish tickets granted, ${taggedSubmissions.size} feedback submissions adopted`,
      )

      return {
        ...version,
        feedbackQuestions: version.feedbackQuestions.map((q) => ({
          id: q.id,
          category: q.category,
          content: q.title,
          isRequired: q.isRequired,
          order: q.order,
        })),
      }
    })
  }

  /** 새 버전은 중복이 아니어야 하고, 기존의 모든 (형식이 맞는) 버전보다 커야 한다 */
  private async assertVersionIsAhead(
    tx: Prisma.TransactionClient,
    projectId: number,
    newVersion: string,
  ) {
    const parsed = parseVersion(newVersion)
    if (!parsed) {
      //DTO의 @Matches가 보장하지만 방어
      throw new UnprocessableDataException(
        `Version '${newVersion}' must be in 'major.minor.patch' format`,
      )
    }

    const existingVersions = await tx.projectVersion.findMany({
      where: { projectId },
      select: { version: true },
    })

    for (const { version } of existingVersions) {
      if (version === newVersion) {
        throw new DuplicateFoundException('ProjectVersion')
      }
      const existingParsed = parseVersion(version)
      //형식 강제 이전의 레거시 버전은 비교 불가 — 건너뜀
      if (!existingParsed) continue
      if (compareVersion(parsed, existingParsed) <= 0) {
        throw new UnprocessableDataException(
          `Version '${newVersion}' must be greater than existing version '${version}'`,
        )
      }
    }
  }

  /** 특정 버전 상세 성장기록 조회 (이미지는 presigned URL, 태그된 피드백 포함) */
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
            adoptions: {
              orderBy: { createdAt: 'asc' },
              select: {
                submission: {
                  select: {
                    id: true,
                    oneLineReview: true,
                    user: {
                      select: {
                        name: true,
                        profileImageUrl: true,
                        jobType: true,
                      },
                    },
                  },
                },
              },
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
      growthRecords: resolved.map(({ adoptions, ...record }) => ({
        ...record,
        taggedFeedbacks: adoptions.map((adoption) => ({
          id: adoption.submission.id,
          author: {
            name: adoption.submission.user.name,
            profileImageUrl: adoption.submission.user.profileImageUrl,
            role: adoption.submission.user.jobType,
          },
          content: adoption.submission.oneLineReview,
        })),
      })),
      feedbackQuestions: version.feedbackQuestions.map((q) => ({
        id: q.id,
        category: q.category,
        content: q.title,
        isRequired: q.isRequired,
        order: q.order,
      })),
    }
  }

  private mergeTaggedFeedbacks(
    tags: TaggedFeedbacksDto[],
  ): Map<RecordCategory, Set<number>> {
    const merged = new Map<RecordCategory, Set<number>>()
    for (const tag of tags) {
      const ids = merged.get(tag.category) ?? new Set<number>()
      tag.submissionIds.forEach((id) => ids.add(id))
      merged.set(tag.category, ids)
    }

    for (const [category, ids] of merged) {
      if (ids.size > MAX_TAGGED_FEEDBACKS_PER_CATEGORY) {
        throw new UnprocessableDataException(
          `Category '${category}' has ${ids.size} tagged feedbacks (max ${MAX_TAGGED_FEEDBACKS_PER_CATEGORY})`,
        )
      }
    }
    return merged
  }

  private async assertTaggable(
    tx: Prisma.TransactionClient,
    projectId: number,
    tagsByCategory: Map<RecordCategory, Set<number>>,
  ): Promise<TaggedSubmissionMap> {
    const submissionIds = [
      ...new Set([...tagsByCategory.values()].flatMap((ids) => [...ids])),
    ]
    if (submissionIds.length === 0) {
      return new Map()
    }

    const submissions = await tx.feedbackSubmission.findMany({
      where: { id: { in: submissionIds } },
      select: {
        id: true,
        projectId: true,
        userId: true,
        adoptions: { select: { id: true }, take: 1 },
        feedbacks: { select: { question: { select: { category: true } } } },
      },
    })
    const submissionById = new Map(submissions.map((s) => [s.id, s]))

    for (const [category, ids] of tagsByCategory) {
      for (const id of ids) {
        const submission = submissionById.get(id)
        //다른 프로젝트의 제출은 존재를 노출하지 않도록 404로 통일
        if (!submission || submission.projectId !== projectId) {
          throw new EntityNotExistException(`FeedbackSubmission(${id})`)
        }
        //기채택 제출은 재태그 불가 (같은 발행 내 다직군 동시 태그만 허용)
        if (submission.adoptions.length > 0) {
          throw new ConflictFoundException(
            `Feedback submission ${id} is already adopted and cannot be tagged again.`,
          )
        }
        //해당 직군 답변이 있는 제출만 그 직군에 태그 가능
        const hasCategoryAnswer = submission.feedbacks.some(
          (f) => f.question.category === category,
        )
        if (!hasCategoryAnswer) {
          throw new UnprocessableDataException(
            `Feedback submission ${id} has no answers for category '${category}'`,
          )
        }
      }
    }

    return new Map(submissions.map((s) => [s.id, { userId: s.userId }]))
  }

  private async adoptTaggedFeedbacks(
    tx: Prisma.TransactionClient,
    growthRecords: { id: number; category: RecordCategory }[],
    tagsByCategory: Map<RecordCategory, Set<number>>,
    taggedSubmissions: TaggedSubmissionMap,
  ) {
    if (taggedSubmissions.size === 0) return

    const recordIdByCategory = new Map(
      growthRecords.map((record) => [record.category, record.id]),
    )

    const adoptionRows: { growthRecordId: number; submissionId: number }[] = []
    const categoryCountBySubmission = new Map<number, number>()
    for (const [category, ids] of tagsByCategory) {
      const growthRecordId = recordIdByCategory.get(category)
      if (!growthRecordId) continue //카테고리 커버리지 검증상 도달 불가 — 방어
      for (const id of ids) {
        adoptionRows.push({ growthRecordId, submissionId: id })
        categoryCountBySubmission.set(
          id,
          (categoryCountBySubmission.get(id) ?? 0) + 1,
        )
      }
    }
    await tx.feedbackAdoption.createMany({ data: adoptionRows })

    //보상: 제출별 단일 직군 +3 / 2개 직군 이상 총 +5, 작성자별 합산(상한 없음)
    const rewardByAuthor = new Map<number, number>()
    for (const [submissionId, categoryCount] of categoryCountBySubmission) {
      const submission = taggedSubmissions.get(submissionId)
      if (!submission) continue //assertTaggable에서 검증됨 — 방어
      const reward =
        categoryCount >= 2
          ? ADOPTION_REWARD_MULTI_CATEGORY
          : ADOPTION_REWARD_SINGLE_CATEGORY
      rewardByAuthor.set(
        submission.userId,
        (rewardByAuthor.get(submission.userId) ?? 0) + reward,
      )
    }

    for (const [authorId, amount] of rewardByAuthor) {
      await tx.user.update({
        where: { id: authorId },
        data: { ownedTicketCount: { increment: amount } },
      })
      this.logger.log(
        `Adoption reward +${amount} tickets granted to feedback author ${authorId}`,
      )
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
