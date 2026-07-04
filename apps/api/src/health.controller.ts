import { Controller, Get } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { Public } from './auth/decorators/public.decorator'

export class HealthResponseDto {
  status: string
}

@ApiTags('Health')
@Controller('health')
export class HealthController {
  @Public()
  @Get()
  check(): HealthResponseDto {
    return { status: 'ok' }
  }
}
