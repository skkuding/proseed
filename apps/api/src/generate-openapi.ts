/**
 * OpenAPI 스펙 정적 산출 → apps/api/openapi.json
 *
 * 실행: pnpm --filter api generate:openapi
 * (swagger CLI 플러그인은 컴파일 타임에 적용되므로 nest build 산출물(dist)을 실행해야 한다)
 *
 * 라우트 메타데이터만 사용하므로 DB/S3 연결 없이 동작하며,
 * ConfigModule validation과 better-auth 초기화를 통과시키기 위한 dummy env를 주입한다.
 */
import { writeFileSync } from 'fs'
import { join } from 'path'

process.env.DATABASE_URL ??=
  'postgresql://openapi:openapi@localhost:5432/openapi'
process.env.AWS_ACCESS_KEY_ID ??= 'openapi'
process.env.AWS_SECRET_ACCESS_KEY ??= 'openapi'
process.env.S3_BUCKET_NAME ??= 'openapi'
process.env.BETTER_AUTH_SECRET ??= 'openapi-spec-generation-only'
process.env.BETTER_AUTH_URL ??= 'http://localhost:3000'
process.env.GOOGLE_CLIENT_ID ??= ''
process.env.GOOGLE_CLIENT_SECRET ??= ''
process.env.KAKAO_CLIENT_ID ??= ''
process.env.KAKAO_CLIENT_SECRET ??= ''
process.env.NAVER_CLIENT_ID ??= ''
process.env.NAVER_CLIENT_SECRET ??= ''

async function generate() {
  const { NestFactory } = await import('@nestjs/core')
  const { AppModule } = await import('./app.module.js')
  const { createOpenApiDocument } = await import('./swagger.js')

  //pnpm 스크립트는 항상 apps/api를 cwd로 실행하므로 빌드 산출물 구조와 무관하다
  const outputPath = join(process.cwd(), 'openapi.json')

  const app = await NestFactory.create(AppModule, { logger: false })
  try {
    const document = createOpenApiDocument(app)
    writeFileSync(outputPath, JSON.stringify(document, null, 2) + '\n')
    console.log(`OpenAPI spec written to ${outputPath}`)
  } finally {
    await app.close()
  }
}

generate().catch((error: unknown) => {
  console.error('Failed to generate OpenAPI spec:', error)
  process.exitCode = 1
})
