import { Injectable } from '@nestjs/common'
import {
  EntityNotExistException,
  ForbiddenAccessException,
} from 'src/common/exceptions/business.exception'
import { PrismaService } from '../prisma/prisma.service'
import type { CreateVersionDto } from './dto/create-version.dto'

@Injectable()
export class GrowthRecordService {
  constructor(private readonly prisma: PrismaService) {}

  /** 성장기록 + 피드백 질문 발행 및 팀원 티켓 보상 (트랜잭션) */
  async createVersion(
    userId: number,
    projectId: number,
    dto: CreateVersionDto,
  ) {
    // 발행 권한: 프로젝트 팀원(ProjectRole)만 가능
    const role = await this.prisma.projectRole.findUnique({
      where: { userId_projectId: { userId, projectId } },
    })
    if (!role) {
      throw new ForbiddenAccessException(
        'Only project members can publish versions.',
      )
    }

    return this.prisma.$transaction(async (tx) => {
      // 1. 버전 + 하위 데이터 일괄 생성
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

      // 2. 팀원 전원 티켓 +1
      const memberIds = await tx.projectRole.findMany({
        where: { projectId },
        select: { userId: true },
      })

      if (memberIds.length > 0) {
        await tx.user.updateMany({
          where: { id: { in: memberIds.map((m) => m.userId) } },
          data: { ownedTicketCount: { increment: 1 } },
        })
      }

      return version
    })
  }

  /** 특정 버전 상세 성장기록 조회 */
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

    return version
  }
}
