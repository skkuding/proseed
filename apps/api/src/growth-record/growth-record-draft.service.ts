import { Injectable } from '@nestjs/common'
import {
  JobType,
  ProjectMemberRole,
  RecordCategory,
  type Prisma,
} from '@prisma/client'
import {
  EntityNotExistException,
  ForbiddenAccessException,
} from 'src/common/exceptions/business.exception'
import { PrismaService } from '../prisma/prisma.service'
import { GrowthRecordDraftResponseDto } from './dto/draft-response.dto'

//팀원의 프로젝트 직군(ProjectRole.role) → 접근 가능한 draft 직군
const JOB_TYPE_TO_CATEGORY: Record<JobType, RecordCategory> = {
  [JobType.Planner]: RecordCategory.PLAN,
  [JobType.Designer]: RecordCategory.DESIGN,
  [JobType.Developer]: RecordCategory.DEVELOPMENT,
  [JobType.Other]: RecordCategory.GENERAL,
}

const DRAFT_SELECT = {
  category: true,
  content: true,
  createdAt: true,
  updatedAt: true,
  updatedBy: {
    select: { id: true, name: true, profileImageUrl: true },
  },
} satisfies Prisma.GrowthRecordDraftSelect

type AccessibleCategories = 'ALL' | RecordCategory[]

/**
 * 발행 전 직군별 공유 임시저장.
 * 같은 직군 팀원들은 하나의 draft를 공유하며(프로젝트 × 직군 unique),
 * 팀원은 자기 직군만 조회/작성/수정 가능하고 리드는 전 직군 접근 가능.
 */
@Injectable()
export class GrowthRecordDraftService {
  constructor(private readonly prisma: PrismaService) {}

  async getDrafts(
    userId: number,
    projectId: number,
  ): Promise<GrowthRecordDraftResponseDto[]> {
    const accessible = await this.getAccessibleCategories(userId, projectId)
    return this.prisma.growthRecordDraft.findMany({
      where: {
        projectId,
        ...(accessible !== 'ALL' && { category: { in: accessible } }),
      },
      orderBy: { category: 'asc' },
      select: DRAFT_SELECT,
    })
  }

  async getDraft(
    userId: number,
    projectId: number,
    category: RecordCategory,
  ): Promise<GrowthRecordDraftResponseDto> {
    await this.assertCategoryAccess(userId, projectId, category)

    const draft = await this.prisma.growthRecordDraft.findUnique({
      where: { projectId_category: { projectId, category } },
      select: DRAFT_SELECT,
    })
    if (!draft) {
      throw new EntityNotExistException('GrowthRecordDraft')
    }
    return draft
  }

  /** 생성/수정 통합 — 직군당 draft가 1개라 upsert로 처리 */
  async upsertDraft(
    userId: number,
    projectId: number,
    category: RecordCategory,
    content: Record<string, unknown>,
  ): Promise<GrowthRecordDraftResponseDto> {
    await this.assertCategoryAccess(userId, projectId, category)

    //JSON body는 직렬화 가능함이 보장되므로 안전한 캐스팅
    const jsonContent = content as Prisma.InputJsonValue
    return this.prisma.growthRecordDraft.upsert({
      where: { projectId_category: { projectId, category } },
      create: {
        projectId,
        category,
        content: jsonContent,
        updatedById: userId,
      },
      update: { content: jsonContent, updatedById: userId },
      select: DRAFT_SELECT,
    })
  }

  async deleteDraft(
    userId: number,
    projectId: number,
    category: RecordCategory,
  ) {
    await this.assertCategoryAccess(userId, projectId, category)

    const draft = await this.prisma.growthRecordDraft.findUnique({
      where: { projectId_category: { projectId, category } },
      select: { id: true },
    })
    if (!draft) {
      throw new EntityNotExistException('GrowthRecordDraft')
    }
    await this.prisma.growthRecordDraft.delete({ where: { id: draft.id } })
  }

  /** 리드는 전 직군, 팀원은 프로젝트 직군(role)에 매핑되는 draft 직군만 */
  private async getAccessibleCategories(
    userId: number,
    projectId: number,
  ): Promise<AccessibleCategories> {
    const role = await this.prisma.projectRole.findUnique({
      where: { userId_projectId: { userId, projectId } },
    })
    if (!role) {
      throw new ForbiddenAccessException(
        'Only project members can access growth record drafts.',
      )
    }
    if (role.projectMemberRole === ProjectMemberRole.Lead) return 'ALL'
    return [JOB_TYPE_TO_CATEGORY[role.role]]
  }

  private async assertCategoryAccess(
    userId: number,
    projectId: number,
    category: RecordCategory,
  ) {
    const accessible = await this.getAccessibleCategories(userId, projectId)
    if (accessible !== 'ALL' && !accessible.includes(category)) {
      throw new ForbiddenAccessException(
        `Only the Lead or '${category}' members can access this draft.`,
      )
    }
  }
}
