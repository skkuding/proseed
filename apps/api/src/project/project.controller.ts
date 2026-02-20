import { Body, Controller, Post, Req } from '@nestjs/common'
import type { AuthenticatedRequest } from 'libs/auth/src/authenticated-request.interface'
import { CreateProjectDto } from './dto/create-project.dto'
import { ProjectService } from './project.service'

@Controller('project')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Post()
  async create(
    @Req() req: AuthenticatedRequest,
    @Body() content: CreateProjectDto,
  ) {
    await this.projectService.create(req.user.id, content)
  }
}
