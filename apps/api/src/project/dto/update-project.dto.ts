import { OmitType, PartialType } from '@nestjs/swagger'
import { CreateProjectDto } from './create-project.dto'

//leaderJobType은 멤버 역할(ProjectRole) 소관이라 프로젝트 수정에서 제외
export class UpdateProjectDto extends PartialType(
  OmitType(CreateProjectDto, ['leaderJobType'] as const),
) {}
