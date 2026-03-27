import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import Instrumentation from './instrumentation'
import { auth } from './auth/better-auth'
import { toNodeHandler } from 'better-auth/node'

async function bootstrap() {
  const otlpEndpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT
  if (otlpEndpoint) {
    const resource = Instrumentation.getResource('proseed-api', '0.0.1')
    Instrumentation.start(otlpEndpoint, resource)
  }

  const app = await NestFactory.create(AppModule)

  app.use('/api/auth', toNodeHandler(auth)) //소셜 로그인 콜백, 세션 조회 등 better-auth 자동 라우트 동작을 위한 미들웨어 등록
  app.setGlobalPrefix('api')
  app.enableCors()
  await app.listen(process.env.PORT ?? 4000)
}
bootstrap()
