import { ValidationPipe, type INestApplication } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { AppModule } from './app.module'
import Instrumentation from './instrumentation'
import { BetterAuthService } from './auth/better-auth.service'
import { toNodeHandler } from 'better-auth/node'

//API 구조 노출 방지를 위해 프로덕션에서는 Swagger를 띄우지 않는다 (/api/docs → 404)
function setupSwagger(app: INestApplication) {
  if (process.env.NODE_ENV === 'production') return

  const config = new DocumentBuilder()
    .setTitle('Proseed API')
    .setDescription(
      '사이드 프로젝트 성장기록·피드백 플랫폼 API. ' +
        '인증은 better-auth 세션 쿠키 기반이며, 로그인 라우트(/api/auth/*)는 better-auth가 별도로 처리하므로 이 문서에 포함되지 않는다. ' +
        '로컬에서는 ENABLE_DEV_LOGIN=true 후 POST /api/auth/sign-in/email (seed 계정)으로 세션을 얻을 수 있다.',
    )
    .setVersion('0.0.1')
    .addCookieAuth('better-auth.session_token')
    .build()

  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api/docs', app, document)
}

async function bootstrap() {
  const otlpEndpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT
  if (otlpEndpoint) {
    const resource = Instrumentation.getResource('proseed-api', '0.0.1')
    Instrumentation.start(otlpEndpoint, resource)
  }

  const app = await NestFactory.create(AppModule)
  const betterAuthService = app.get(BetterAuthService)

  app.enableCors({ origin: process.env.BETTER_AUTH_URL, credentials: true })
  //소셜 로그인 callback, 세션 조회 등 better-auth의 모든 요청은 /api/auth경로에 마운트
  app.use('/api/auth', toNodeHandler(betterAuthService.auth)) //미들웨어 단계라서 아래 라우트 글로벌 설정 전에 적용됨. (충돌 X)
  app.setGlobalPrefix('api')
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }))
  setupSwagger(app)
  await app.listen(process.env.PORT ?? 4000)
}
void bootstrap()
