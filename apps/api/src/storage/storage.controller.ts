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
import { IsNotEmpty, IsString } from 'class-validator'
import { Public } from 'src/auth/decorators/public.decorator'
import { StorageService } from './storage.service'

class GetUploadUrlDto {
  @IsString()
  @IsNotEmpty()
  filename: string

  @IsString()
  @IsNotEmpty()
  contentType: string
}

//upload-url/download-url/delete는 전역 가드로 인증 필수 (health만 공개)
@Controller('storage')
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @Public()
  @Get('health')
  async checkHealth() {
    return this.storageService.getBucketStatus()
  }

  @Post('upload-url')
  async getUploadUrl(@Body() dto: GetUploadUrlDto) {
    const key = `uploads/${Date.now()}-${dto.filename}`
    const url = await this.storageService.getSignedUploadUrl(
      key,
      dto.contentType,
    )

    return { url, key }
  }

  @Get('download-url/*key')
  async getDownloadUrl(@Param('key') key: string) {
    const url = await this.storageService.getSignedDownloadUrl(key)
    return { url }
  }

  @Delete('*key')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteFile(@Param('key') key: string) {
    await this.storageService.deleteFile(key)
  }
}
