import { Controller, Get } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { Public } from './auth/decorators/public.decorator'

@ApiTags('Health')
@Controller('health')
export class HealthController {
  @Public()
  @Get()
  check() {
    return { status: 'ok' }
  }
}
