import { Injectable } from '@nestjs/common'
import type { Prisma } from '@prisma/client'
import { ProjectRoleType } from '@prisma/client'
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
        versions: {
          select: {
            _count: {
              select: { feedbacks: true },
            },
          },
        },
      },
    })

    const hasNextPage = projects.length > take
    const sliced = hasNextPage ? projects.slice(0, take) : projects

    /* eslint-disable @typescript-eslint/no-explicit-any */
    const data = sliced.map((project: any) => {
      const { versions, ...rest } = project
      const feedbackCount = versions.reduce(
        (sum: number, v: any) => sum + v._count.feedbacks,
        0,
      )
      return { ...rest, feedbackCount }
    })

    const nextCursor = hasNextPage ? data[data.length - 1]?.id : null

    return {
      data,
      nextCursor,
      hasNextPage,
    }
    /* eslint-enable @typescript-eslint/no-explicit-any */
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
        versions: {
          select: {
            _count: {
              select: { feedbacks: true },
            },
          },
        },
      },
    })

    /* eslint-disable @typescript-eslint/no-explicit-any */
    return projects.map((project: any) => {
      const { versions, ...rest } = project
      const feedbackCount = versions.reduce(
        (sum: number, v: any) => sum + v._count.feedbacks,
        0,
      )
      return { ...rest, feedbackCount }
    })
    /* eslint-enable @typescript-eslint/no-explicit-any */
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
            role: 'ADMIN',
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
  ) {
    const projectRole = await this.prisma.projectRole.findFirst({
      where: {
        userId,
        projectId,
        role: ProjectRoleType.ADMIN,
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
        role: 'MEMBER',
      },
    })
  }

  // 프로젝트 성장기록 조회 페이지에서 버전 드롭다운
  async getProjectVersions(projectId: number) {
    const versions = await this.prisma.projectVersion.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        version: true,
        createdAt: true,
      },
    })

    return versions
  }

  async getGrowthRecordsByVersion(versionId: number) {
    const version = await this.prisma.projectVersion.findUnique({
      where: { id: versionId },
      include: {
        growthRecords: {
          orderBy: { category: 'asc' },
          include: {
            contents: {
              select: {
                title: true,
                content: true,
              },
              orderBy: { isDefault: 'desc' },
            },
            images: {
              select: {
                order: true,
                url: true,
              },
              orderBy: { order: 'asc' },
            },
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
