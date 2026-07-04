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
import { ApiCookieAuth, ApiTags } from '@nestjs/swagger'
import { OptionalAuth, Public } from 'src/auth/decorators/public.decorator'
import type {
  OptionalUserRequest,
  RequestWithUser,
} from 'src/common/types/request-with-user.type'
import { CreateProjectDto } from './dto/create-project.dto'
import {
  ProjectDetailResponseDto,
  ProjectListItemDto,
  ProjectListResponseDto,
  ProjectResponseDto,
  ProjectRoleResponseDto,
  ProjectVersionListItemDto,
} from './dto/project-response.dto'
import { GetProjectsDto } from './dto/get-projects.dto'
import { InviteCollaboratorDto } from './dto/invite-collaborator.dto'
import { ProjectService } from './project.service'

@ApiTags('Project')
@Controller('project')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @ApiCookieAuth()
  @Post()
  async create(
    @Req() req: RequestWithUser,
    @Body() content: CreateProjectDto,
  ): Promise<ProjectResponseDto> {
    return this.projectService.create(req.user.id, content)
  }

  @Public()
  @Get()
  async getProjects(
    @Query() query: GetProjectsDto,
  ): Promise<ProjectListResponseDto> {
    return this.projectService.getProjects(query)
  }

  @ApiCookieAuth()
  @Get('my')
  async getMyProjects(
    @Req() req: RequestWithUser,
  ): Promise<ProjectListItemDto[]> {
    return this.projectService.getMyProjects(req.user.id)
  }

  //비로그인도 조회 가능, 세션이 있으면 isMyProject 판별에 사용
  @OptionalAuth()
  @Get(':id')
  async getProjectById(
    @Req() req: OptionalUserRequest,
    @Param('id', ParseIntPipe) projectId: number,
  ): Promise<ProjectDetailResponseDto> {
    return this.projectService.getProjectById(req.user?.id, projectId)
  }

  @ApiCookieAuth()
  @Post(':id/invite')
  async inviteCollaborator(
    @Req() req: RequestWithUser,
    @Param('id', ParseIntPipe) projectId: number,
    @Body() dto: InviteCollaboratorDto,
  ): Promise<ProjectRoleResponseDto> {
    return this.projectService.inviteCollaborator(
      req.user.id,
      projectId,
      dto.email,
      dto.role,
    )
  }

  @Public()
  @Get(':id/versions')
  async getProjectVersions(
    @Param('id', ParseIntPipe) projectId: number,
  ): Promise<ProjectVersionListItemDto[]> {
    return this.projectService.getProjectVersions(projectId)
  }
}
