import {
  Body,
  Controller,
  Get,
  Header,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Redirect,
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
  MyProjectListItemDto,
  ProjectListResponseDto,
  ProjectResponseDto,
  ProjectRoleResponseDto,
  ProjectVersionListItemDto,
} from './dto/project-response.dto'
import { GetProjectsDto } from './dto/get-projects.dto'
import { InviteCollaboratorDto } from './dto/invite-collaborator.dto'
import { UpdateProjectDto } from './dto/update-project.dto'
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
  ): Promise<MyProjectListItemDto[]> {
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

  //프로젝트 편집 저장 — Lead만 (서비스에서 검증)
  @ApiCookieAuth()
  @Patch(':id')
  async update(
    @Req() req: RequestWithUser,
    @Param('id', ParseIntPipe) projectId: number,
    @Body() dto: UpdateProjectDto,
  ): Promise<ProjectResponseDto> {
    return this.projectService.update(req.user.id, projectId, dto)
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

  // 공유 카드(og:image)용 안정 URL. presigned 는 만료되므로 이 고정 엔드포인트가
  // 매 요청 새 presigned 로 302 리다이렉트한다 → 크롤러가 이 URL 을 캐시해도 이미지가 안 깨진다.
  @Public()
  @Get(':id/thumbnail')
  @Header('Cache-Control', 'no-store')
  @Redirect()
  async getThumbnail(
    @Param('id', ParseIntPipe) projectId: number,
  ): Promise<{ url: string; statusCode: number }> {
    const url = await this.projectService.getThumbnailPresignedUrl(projectId)
    return { url, statusCode: 302 }
  }

  @Public()
  @Get(':id/versions')
  async getProjectVersions(
    @Param('id', ParseIntPipe) projectId: number,
  ): Promise<ProjectVersionListItemDto[]> {
    return this.projectService.getProjectVersions(projectId)
  }
}
