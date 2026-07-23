import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common'
import { ApiCookieAuth, ApiTags } from '@nestjs/swagger'
import { IsNotEmpty, IsString } from 'class-validator'
import { Public } from 'src/auth/decorators/public.decorator'
import {
  BucketStatusResponseDto,
  DownloadUrlResponseDto,
  UploadUrlResponseDto,
} from './dto/storage-response.dto'
import { StorageService } from './storage.service'

class GetUploadUrlDto {
  @IsString()
  @IsNotEmpty()
  filename: string

  @IsString()
  @IsNotEmpty()
  contentType: string
}

//Express 5(path-to-regexp v6+)의 명명된 wildcard(*key)는 세그먼트 배열로 캡처되므로
//'/'로 다시 이어 붙여야 원래의 S3 key(슬래시 포함)가 복원된다
function joinKey(key: string | string[]): string {
  return Array.isArray(key) ? key.join('/') : key
}

//upload-url/download-url/delete는 전역 가드로 인증 필수 (health만 공개)
@ApiTags('Storage')
@Controller('storage')
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @Public()
  @Get('health')
  async checkHealth(): Promise<BucketStatusResponseDto> {
    return this.storageService.getBucketStatus()
  }

  @ApiCookieAuth()
  @Post('upload-url')
  async getUploadUrl(
    @Body() dto: GetUploadUrlDto,
  ): Promise<UploadUrlResponseDto> {
    const key = `uploads/${Date.now()}-${dto.filename}`
    const url = await this.storageService.getSignedUploadUrl(
      key,
      dto.contentType,
    )

    return { url, key }
  }

  @ApiCookieAuth()
  @Get('download-url/*key')
  async getDownloadUrl(
    @Param('key') key: string | string[],
  ): Promise<DownloadUrlResponseDto> {
    const url = await this.storageService.getSignedDownloadUrl(joinKey(key))
    return { url }
  }

  @ApiCookieAuth()
  @Delete('*key')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteFile(@Param('key') key: string | string[]): Promise<void> {
    await this.storageService.deleteFile(joinKey(key))
  }
}
