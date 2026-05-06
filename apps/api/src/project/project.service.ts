import { Injectable } from '@nestjs/common'
import type { JobType, Prisma } from '@prisma/client'
import {
  EntityNotExistException,
  ForbiddenAccessException,
} from 'src/common/exceptions/business.exception'
import { PrismaService } from '../prisma/prisma.service'
import { CreateProjectDto } from './dto/create-project.dto'
import type { GetProjectsDto } from './dto/get-projects.dto'

@Injectable()
export class ProjectService {
  constructor(private readonly prisma: PrismaService) {}

  async getProjects(dto: GetProjectsDto) {
    const { search, category, take = 9, cursor } = dto

    const where: Prisma.ProjectWhereInput = {
      ...(search && {
        title: {
          contains: search,
          mode: 'insensitive' as const,
        },
      }),
      ...(category && {
        category: {
          has: category,
        },
      }),
    }

    const projects = await this.prisma.project.findMany({
      where,
      take: take + 1,
      ...(cursor && {
        cursor: { id: cursor },
        skip: 1,
      }),
      orderBy: { id: 'desc' },
      select: {
        id: true,
        title: true,
        oneLineDescription: true,
        category: true,
        thumbnailUrl: true,
        _count: {
          select: {
            versions: true,
          },
        },
      },
    })

    const hasNextPage = projects.length > take
    const sliced = hasNextPage ? projects.slice(0, take) : projects
    const projectIds = sliced.map((p) => p.id)

    const feedbackCounts = await this.getFeedbackCountsByProjectIds(projectIds)

    const data = sliced.map((project) => ({
      ...project,
      feedbackCount: feedbackCounts.get(project.id) ?? 0,
    }))

    const nextCursor = hasNextPage ? data[data.length - 1]?.id : null

    return {
      data,
      nextCursor,
      hasNextPage,
    }
  }

  private async getFeedbackCountsByProjectIds(
    projectIds: number[],
  ): Promise<Map<number, number>> {
    if (projectIds.length === 0) return new Map()

    const feedbackCounts = await this.prisma.feedbackSubmission.groupBy({
      by: ['projectId'],
      where: {
        projectId: { in: projectIds },
      },
      _count: { _all: true },
    })

    const result = new Map<number, number>()
    for (const count of feedbackCounts) {
      result.set(count.projectId, count._count._all)
    }

    return result
  }

  async getMyProjects(userId: number) {
    const projects = await this.prisma.project.findMany({
      where: {
        createdById: userId,
      },
      select: {
        id: true,
        title: true,
        oneLineDescription: true,
        category: true,
        thumbnailUrl: true,
        _count: {
          select: {
            versions: true,
          },
        },
      },
    })

    const projectIds = projects.map((p) => p.id)
    const feedbackCounts = await this.getFeedbackCountsByProjectIds(projectIds)

    return projects.map((project) => ({
      ...project,
      feedbackCount: feedbackCounts.get(project.id) ?? 0,
    }))
  }

  async getProjectById(userId: number, projectId: number) {
    const [project, myRole] = await Promise.all([
      this.prisma.project.findUnique({
        where: { id: projectId },
        include: {
          images: {
            orderBy: { order: 'asc' },
            select: {
              order: true,
              url: true,
            },
          },
          projectRoles: {
            select: {
              id: true,
              user: {
                select: {
                  name: true,
                  profileImageUrl: true,
                },
              },
              role: true,
            },
          },
        },
      }),
      this.prisma.projectRole.findUnique({
        where: {
          userId_projectId: { userId, projectId },
        },
        select: { role: true },
      }),
    ])

    if (!project) {
      throw new EntityNotExistException('Project')
    }

    return {
      ...project,
      isMyProject: myRole !== null,
    }
  }

  async create(userId: number, dto: CreateProjectDto) {
    return this.prisma.project.create({
      data: {
        title: dto.title,
        type: dto.type,
        status: dto.status,
        createdById: userId,
        oneLineDescription: dto.oneLineDescription,
        description: dto.description,
        category: dto.category,
        contactPath: dto.contactPath,
        projectLink: dto.projectLink,
        iconUrl: dto.iconKey,
        thumbnailUrl: dto.thumbnailKey,
        projectRoles: {
          create: {
            userId,
            isLeader: true,
            role: dto.leaderJobType,
          },
        },
        images: {
          create: dto.imageKeys.map((key, index) => ({
            url: key,
            order: index,
          })),
        },
      },
    })
  }

  async inviteCollaborator(
    userId: number,
    projectId: number,
    targetEmail: string,
    role: JobType,
  ) {
    const projectRole = await this.prisma.projectRole.findFirst({
      where: {
        userId,
        projectId,
        isLeader: true,
      },
    })

    if (!projectRole) {
      throw new ForbiddenAccessException('Only Admin can invite collaborators.')
    }

    const targetUser = await this.prisma.user.findFirst({
      where: {
        email: targetEmail,
      },
    })

    if (!targetUser) {
      throw new EntityNotExistException('User')
    }

    return await this.prisma.projectRole.create({
      data: {
        userId: targetUser.id,
        projectId,
        isLeader: false,
        role,
      },
    })
  }

  async getProjectVersions(projectId: number) {
    return this.prisma.projectVersion.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        version: true,
        createdAt: true,
      },
    })
  }
}
