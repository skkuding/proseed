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

  //소셜 로그인 callback, 세션 조회 등 better-auth를 미들웨어 등록해서 /api/auth로 들어오는 모든 요청을 처리해버림.
  app.use('/api/auth', toNodeHandler(betterAuthService.auth))
  app.setGlobalPrefix('api')
  app.enableCors()
  await app.listen(process.env.PORT ?? 4000)
}
bootstrap()
