import { Type } from 'class-transformer'
import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator'
import { ProjectCategory } from './create-project.dto'

export class GetProjectsDto {
  @IsOptional()
  @IsString()
  search?: string

  @IsOptional()
  @IsEnum(ProjectCategory)
  category?: ProjectCategory

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  take?: number = 9

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  cursor?: number
}
