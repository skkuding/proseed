import { BetterAuthService } from '../better-auth.service'
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { fromNodeHeaders } from 'better-auth/node'
import type { RequestWithUser } from 'src/common/types/request-with-user.type'
import {
  IS_OPTIONAL_AUTH_KEY,
  IS_PUBLIC_KEY,
} from '../decorators/public.decorator'

@Injectable()
export class BetterAuthGuard implements CanActivate {
  constructor(
    private readonly betterAuthService: BetterAuthService,
    private readonly reflector: Reflector,
  ) {}

  //요청 헤더에서 세션 쿠키 존재하는지 확인
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ])
    if (isPublic) return true //공개 라우트는 세션 조회 없이 통과

    const isOptionalAuth = this.reflector.getAllAndOverride<boolean>(
      IS_OPTIONAL_AUTH_KEY,
      [context.getHandler(), context.getClass()],
    )

    //DB에서 session 테이블 조회
    const req = context.switchToHttp().getRequest<RequestWithUser>()
    const session = await this.betterAuthService.auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    })

    if (!session) {
      if (isOptionalAuth) return true //비로그인 허용 (req.user 미주입)
      throw new UnauthorizedException()
    }

    //세션 유효한지 체크 후, req에 userId 넣기
    const userIdNumber = Number(session.user.id) //DB insert/fetch 외에는 id가 string type -> number로 형변환
    if (isNaN(userIdNumber)) {
      if (isOptionalAuth) return true
      throw new UnauthorizedException('Invalid User')
    }
    req.user = { id: userIdNumber } //req 객체에 user 프로퍼티 추가해주기
    return true
  }
}
