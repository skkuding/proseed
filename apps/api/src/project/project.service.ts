import { Injectable } from '@nestjs/common'
import { ProjectRoleType } from '@prisma/client'
import {
  EntityNotExistException,
  ForbiddenAccessException,
} from 'src/common/exceptions/business.exception'
import { PrismaService } from '../prisma/prisma.service'
import { CreateProjectDto } from './dto/create-project.dto'

@Injectable()
export class ProjectService {
  constructor(private readonly prisma: PrismaService) {}

  async getMyProjects(userId: number) {
    return this.prisma.project.findMany({
      where: {
        createdById: userId,
      },
      select: {
        id: true,
        title: true,
        oneLineDescription: true,
        category: true,
        iconUrl: true,
        thumbnailUrl: true,
        _count: {
          select: {
            growthRecords: true,
            feedbacks: true,
          },
        },
      },
    })
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
}
