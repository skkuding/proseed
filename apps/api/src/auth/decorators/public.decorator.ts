import { SetMetadata } from '@nestjs/common'

export const IS_PUBLIC_KEY = 'isPublic'
/** 전역 가드 opt-out — 인증 없이 접근 가능한 공개 라우트 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true)

export const IS_OPTIONAL_AUTH_KEY = 'isOptionalAuth'
/** 비로그인 허용, 유효한 세션이 있으면 req.user 주입 (예: isMyProject 판별용) */
export const OptionalAuth = () => SetMetadata(IS_OPTIONAL_AUTH_KEY, true)
