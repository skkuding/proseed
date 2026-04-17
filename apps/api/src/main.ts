import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import Instrumentation from './instrumentation'
import { BetterAuthService } from './auth/better-auth.service'
import { toNodeHandler } from 'better-auth/node'

async function bootstrap() {
  const otlpEndpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT
  if (otlpEndpoint) {
    const resource = Instrumentation.getResource('proseed-api', '0.0.1')
    Instrumentation.start(otlpEndpoint, resource)
  }

  const app = await NestFactory.create(AppModule)
  const betterAuthService = app.get(BetterAuthService)

  //소셜 로그인 callback, 세션 조회 등 better-auth의 모든 요청은 /api/auth경로에 마운트
  app.use('/api/auth', toNodeHandler(betterAuthService.auth)) //미들웨어 단계라서 아래 라우트 글로벌 설정 전에 적용됨. (충돌 X)
  app.setGlobalPrefix('api')
  app.enableCors()
  await app.listen(process.env.PORT ?? 4000)
}
bootstrap()
