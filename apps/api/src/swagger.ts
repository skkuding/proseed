import type { INestApplication } from '@nestjs/common'
import {
  DocumentBuilder,
  SwaggerModule,
  type OpenAPIObject,
} from '@nestjs/swagger'

/** Swagger UI와 정적 스펙 산출(generate-openapi)이 공유하는 문서 정의 */
export function createOpenApiDocument(app: INestApplication): OpenAPIObject {
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

  return SwaggerModule.createDocument(app, config)
}

//API 구조 노출 방지를 위해 프로덕션에서는 Swagger를 띄우지 않는다 (/api/docs → 404)
export function setupSwagger(app: INestApplication) {
  if (process.env.NODE_ENV === 'production') return

  SwaggerModule.setup('api/docs', app, createOpenApiDocument(app))
}
