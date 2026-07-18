import { Injectable } from '@nestjs/common'
import { ProjectMemberRole, type JobType, type Prisma } from '@prisma/client'
import {
  EntityNotExistException,
  ForbiddenAccessException,
} from 'src/common/exceptions/business.exception'
import { PrismaService } from '../prisma/prisma.service'
import { StorageService } from '../storage/storage.service'
import { CreateProjectDto } from './dto/create-project.dto'
import type { GetProjectsDto } from './dto/get-projects.dto'
import type { UpdateProjectDto } from './dto/update-project.dto'

@Injectable()
export class ProjectService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
  ) {}

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

    const [feedbackCounts, resolved] = await Promise.all([
      this.getFeedbackCountsByProjectIds(projectIds),
      this.resolveThumbnailUrls(sliced),
    ])

    const data = resolved.map((project) => ({
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
    if (projectIds.length === 0) {
      return new Map()
    }

    const submissionsWithCounts = await this.prisma.feedbackSubmission.findMany(
      {
        where: {
          projectId: { in: projectIds },
        },
        select: {
          projectId: true,
          _count: {
            select: { feedbacks: true },
          },
        },
      },
    )

    const result = new Map<number, number>()
    for (const sub of submissionsWithCounts) {
      result.set(
        sub.projectId,
        (result.get(sub.projectId) ?? 0) + sub._count.feedbacks,
      )
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
    const [feedbackCounts, resolved] = await Promise.all([
      this.getFeedbackCountsByProjectIds(projectIds),
      this.resolveThumbnailUrls(projects),
    ])

    return resolved.map((project) => ({
      ...project,
      feedbackCount: feedbackCounts.get(project.id) ?? 0,
    }))
  }

  /* 마이페이지 - 내가 참여중인 프로젝트 (나의 직무, 역할도 포함) */
  async getJoinedProjects(userId: number) {
    const projectRoles = await this.prisma.projectRole.findMany({
      where: { userId },
      orderBy: { projectId: 'desc' },
      select: {
        role: true,
        projectMemberRole: true,
        project: {
          select: {
            id: true,
            title: true,
            oneLineDescription: true,
            iconUrl: true,
          },
        },
      },
    })

    return Promise.all(
      projectRoles.map(async (projectRole) => ({
        ...projectRole.project,
        iconUrl: await this.storage.getSignedDownloadUrl(
          projectRole.project.iconUrl,
        ),
        role: projectRole.role,
        projectMemberRole: projectRole.projectMemberRole,
      })),
    )
  }

  /** 목록용: thumbnailUrl (S3 key) → presigned download URL 일괄 변환 */
  private async resolveThumbnailUrls<T extends { thumbnailUrl: string }>(
    projects: T[],
  ): Promise<T[]> {
    if (projects.length === 0) return projects

    const urlMap = new Map<string, string>()
    await Promise.all(
      [...new Set(projects.map((p) => p.thumbnailUrl))].map(async (key) => {
        urlMap.set(key, await this.storage.getSignedDownloadUrl(key))
      }),
    )

    return projects.map((p) => ({
      ...p,
      thumbnailUrl: urlMap.get(p.thumbnailUrl) ?? p.thumbnailUrl,
    }))
  }

  async getProjectById(userId: number | undefined, projectId: number) {
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
              userId: true,
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
      userId
        ? this.prisma.projectRole.findUnique({
            where: {
              userId_projectId: { userId, projectId },
            },
            select: { role: true },
          })
        : Promise.resolve(null),
    ])

    if (!project) {
      throw new EntityNotExistException('Project')
    }

    const [iconUrl, thumbnailUrl, images] = await Promise.all([
      this.storage.getSignedDownloadUrl(project.iconUrl),
      this.storage.getSignedDownloadUrl(project.thumbnailUrl),
      Promise.all(
        project.images.map(async (image) => ({
          ...image,
          url: await this.storage.getSignedDownloadUrl(image.url),
        })),
      ),
    ])

    return {
      ...project,
      iconUrl,
      thumbnailUrl,
      images,
      isMyProject: myRole !== null,
      myJobType: myRole?.role ?? null,
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
            projectMemberRole: ProjectMemberRole.Lead,
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

  /** 프로젝트 편집 저장 — Lead만. imageKeys가 오면 이미지 전체 교체 */
  async update(userId: number, projectId: number, dto: UpdateProjectDto) {
    //존재(404)와 Lead 권한(403)을 한 번의 쿼리로 검증
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      select: {
        id: true,
        projectRoles: {
          where: {
            userId,
            projectMemberRole: ProjectMemberRole.Lead,
          },
          select: { id: true },
        },
      },
    })
    if (!project) {
      throw new EntityNotExistException('Project')
    }
    if (project.projectRoles.length === 0) {
      throw new ForbiddenAccessException('Only Lead can update the project.')
    }

    const { iconKey, thumbnailKey, imageKeys, ...scalars } = dto

    const updated = await this.prisma.$transaction(async (tx) => {
      if (imageKeys) {
        await tx.projectImage.deleteMany({ where: { projectId } })
      }

      return tx.project.update({
        where: { id: projectId },
        data: {
          ...scalars,
          ...(iconKey && { iconUrl: iconKey }),
          ...(thumbnailKey && { thumbnailUrl: thumbnailKey }),
          ...(imageKeys && {
            images: {
              create: imageKeys.map((key, index) => ({
                url: key,
                order: index,
              })),
            },
          }),
        },
      })
    })

    //응답은 FE가 바로 렌더링할 수 있도록 presigned URL로 변환 (getProjectById와 동일)
    const [iconUrl, thumbnailUrl] = await Promise.all([
      this.storage.getSignedDownloadUrl(updated.iconUrl),
      this.storage.getSignedDownloadUrl(updated.thumbnailUrl),
    ])

    return { ...updated, iconUrl, thumbnailUrl }
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
        projectMemberRole: ProjectMemberRole.Lead,
      },
    })

    if (!projectRole) {
      throw new ForbiddenAccessException('Only Lead can invite collaborators.')
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
        projectMemberRole: ProjectMemberRole.TeamMember,
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
