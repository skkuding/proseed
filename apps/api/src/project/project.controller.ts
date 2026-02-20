import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Req,
} from '@nestjs/common'
import type { AuthenticatedRequest } from 'libs/auth/src/authenticated-request.interface'
import { CreateProjectDto } from './dto/create-project.dto'
import { GetProjectsDto } from './dto/get-projects.dto'
import { InviteCollaboratorDto } from './dto/invite-collaborator.dto'
import { ProjectService } from './project.service'

@Controller('project')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Post()
  async create(
    @Req() req: AuthenticatedRequest,
    @Body() content: CreateProjectDto,
  ) {
    return this.projectService.create(req.user.id, content)
  }

  @Get()
  async getProjects(@Query() query: GetProjectsDto) {
    return this.projectService.getProjects(query)
  }

  @Get('my')
  async getMyProjects(@Req() req: AuthenticatedRequest) {
    return this.projectService.getMyProjects(req.user.id)
  }

  @Get(':id')
  async getProjectById(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseIntPipe) projectId: number,
  ) {
    return this.projectService.getProjectById(req.user.id, projectId)
  }

  @Post(':id/invite')
  async inviteCollaborator(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseIntPipe) projectId: number,
    @Body() dto: InviteCollaboratorDto,
  ) {
    return this.projectService.inviteCollaborator(
      req.user.id,
      projectId,
      dto.email,
    )
  }

  @Get(':id/versions')
  async getProjectVersions(@Param('id', ParseIntPipe) projectId: number) {
    return this.projectService.getProjectVersions(projectId)
  }

  @Get(':id/versions/:versionId')
  async getGrowthRecordsByVersion(
    @Param('versionId', ParseIntPipe) versionId: number,
  ) {
    return this.projectService.getGrowthRecordsByVersion(versionId)
  }
}
