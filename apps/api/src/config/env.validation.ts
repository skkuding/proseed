import { plainToInstance } from 'class-transformer'
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateIf,
  validateSync,
} from 'class-validator'

const isProduction = (env: EnvironmentVariables) =>
  env.NODE_ENV === 'production'

class EnvironmentVariables {
  @IsString()
  @IsOptional()
  NODE_ENV?: string

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

  // Better-Auth 환경 변수
  @IsString()
  @IsNotEmpty()
  BETTER_AUTH_SECRET!: string

  // Optional: library falls back to localhost in dev; production gets the public URL from configmap
  @IsString()
  @IsOptional()
  BETTER_AUTH_URL?: string

  // OAuth (required in production for social login, optional locally)
  @ValidateIf(isProduction)
  @IsString()
  @IsNotEmpty()
  GOOGLE_CLIENT_ID?: string

  @ValidateIf(isProduction)
  @IsString()
  @IsNotEmpty()
  GOOGLE_CLIENT_SECRET?: string

  @ValidateIf(isProduction)
  @IsString()
  @IsNotEmpty()
  KAKAO_CLIENT_ID?: string

  @ValidateIf(isProduction)
  @IsString()
  @IsNotEmpty()
  KAKAO_CLIENT_SECRET?: string

  @ValidateIf(isProduction)
  @IsString()
  @IsNotEmpty()
  NAVER_CLIENT_ID?: string

  @ValidateIf(isProduction)
  @IsString()
  @IsNotEmpty()
  NAVER_CLIENT_SECRET?: string
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
