import { BetterAuthService } from '../better-auth.service'
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { fromNodeHeaders } from 'better-auth/node'
import type { RequestWithUser } from 'src/common/types/request-with-user.type'

@Injectable()
export class BetterAuthGuard implements CanActivate {
  constructor(private readonly betterAuthService: BetterAuthService) {}
  //요청 헤더에서 세션 쿠키 존재하는지 확인
  async canActivate(context: ExecutionContext): Promise<boolean> {
    //DB에서 session 테이블 조회
    const req = context.switchToHttp().getRequest<RequestWithUser>()
    const session = await this.betterAuthService.auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    })

    if (!session) throw new UnauthorizedException()

    //세션 유효한지 체크 후, req에 userId 넣기
    const userIdNumber = Number(session.user.id) //DB insert/fetch 외에는 id가 string type -> number로 형변환
    if (isNaN(userIdNumber)) {
      throw new UnauthorizedException('Invalid User')
    }
    req.user = { id: userIdNumber } //req 객체에 user 프로퍼티 추가해주기
    return true
  }
}
