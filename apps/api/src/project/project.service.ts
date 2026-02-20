import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateProjectDto } from './dto/create-project.dto'

@Injectable()
export class ProjectService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateProjectDto) {
    return this.prisma.project.create({
      data: {
        title: dto.title,
        type: dto.type,
        status: dto.status,
        oneLineDescription: dto.oneLineDescription,
        description: dto.description,
        category: dto.category,
        contactPath: dto.contactPath,
        projectLink: dto.projectLink,
        iconUrl: dto.iconUrl,
      },
    })
  }
}
