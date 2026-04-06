import { plainToInstance } from 'class-transformer'
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  validateSync,
} from 'class-validator'

class EnvironmentVariables {
  @IsString()
  DATABASE_URL!: string

  @IsNumber()
  @IsOptional()
  PORT?: number

  @IsString()
  @IsOptional()
  OTEL_EXPORTER_OTLP_ENDPOINT?: string

  // S3 / MinIO (required)
  @IsString()
  AWS_ACCESS_KEY_ID!: string

  @IsString()
  AWS_SECRET_ACCESS_KEY!: string

  @IsString()
  S3_BUCKET_NAME!: string

  // Optional: region defaults to ap-northeast-2
  @IsString()
  @IsOptional()
  AWS_REGION?: string

  // If set, use MinIO instead of AWS S3
  @IsString()
  @IsOptional()
  S3_ENDPOINT?: string

  //Better-Auth 환경 변수
  @IsString()
  @IsNotEmpty()
  BETTER_AUTH_SECRET!: string

  //Base URL -> 실제 배포할때 소셜 로그인 callback할때 반드시 필요!!!!
  @IsString()
  BETTER_AUTH_URL?: string

  //소셜 로그인 환경 변수
  @IsString()
  @IsNotEmpty()
  GOOGLE_CLIENT_ID!: string

  @IsString()
  @IsNotEmpty()
  GOOGLE_CLIENT_SECRET!: string

  @IsString()
  @IsNotEmpty()
  KAKAO_CLIENT_ID!: string

  @IsString()
  @IsNotEmpty()
  KAKAO_CLIENT_SECRET!: string

  @IsString()
  @IsNotEmpty()
  NAVER_CLIENT_ID!: string

  @IsString()
  @IsNotEmpty()
  NAVER_CLIENT_SECRET!: string
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  })

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  })

  if (errors.length > 0) {
    const errorMessages = errors
      .map((error) => {
        const constraints = error.constraints
          ? Object.values(error.constraints).join(', ')
          : 'unknown error'
        return `${error.property}: ${constraints}`
      })
      .join('\n')

    throw new Error(`Environment validation failed:\n${errorMessages}`)
  }

  return validatedConfig
}
