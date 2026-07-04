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
import { OptionalAuth, Public } from 'src/auth/decorators/public.decorator'
import type {
  OptionalUserRequest,
  RequestWithUser,
} from 'src/common/types/request-with-user.type'
import { CreateProjectDto } from './dto/create-project.dto'
import { GetProjectsDto } from './dto/get-projects.dto'
import { InviteCollaboratorDto } from './dto/invite-collaborator.dto'
import { ProjectService } from './project.service'

@Controller('project')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Post()
  async create(@Req() req: RequestWithUser, @Body() content: CreateProjectDto) {
    return this.projectService.create(req.user.id, content)
  }

  @Public()
  @Get()
  async getProjects(@Query() query: GetProjectsDto) {
    return this.projectService.getProjects(query)
  }

  @Get('my')
  async getMyProjects(@Req() req: RequestWithUser) {
    return this.projectService.getMyProjects(req.user.id)
  }

  //비로그인도 조회 가능, 세션이 있으면 isMyProject 판별에 사용
  @OptionalAuth()
  @Get(':id')
  async getProjectById(
    @Req() req: OptionalUserRequest,
    @Param('id', ParseIntPipe) projectId: number,
  ) {
    return this.projectService.getProjectById(req.user?.id, projectId)
  }

  @Post(':id/invite')
  async inviteCollaborator(
    @Req() req: RequestWithUser,
    @Param('id', ParseIntPipe) projectId: number,
    @Body() dto: InviteCollaboratorDto,
  ) {
    return this.projectService.inviteCollaborator(
      req.user.id,
      projectId,
      dto.email,
      dto.role,
    )
  }

  @Public()
  @Get(':id/versions')
  async getProjectVersions(@Param('id', ParseIntPipe) projectId: number) {
    return this.projectService.getProjectVersions(projectId)
  }
}
