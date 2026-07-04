import type { Request } from 'express'

export interface RequestWithUser extends Request {
  user: { id: number }
}

/** @OptionalAuth() 라우트용 — 비로그인 시 user 미주입 */
export interface OptionalUserRequest extends Request {
  user?: { id: number }
}
