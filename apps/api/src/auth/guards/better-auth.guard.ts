import { BetterAuthService } from '../better-auth.service'
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { fromNodeHeaders } from 'better-auth/node'
import { ConfigService } from '@nestjs/config'
import type { RequestWithUser } from 'src/common/types/request-with-user.type'

@Injectable()
export class BetterAuthGuard implements CanActivate {
  constructor(
    private readonly betterAuthService: BetterAuthService,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<RequestWithUser>()
    const session = await this.betterAuthService.auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    })

    if (!session) throw new UnauthorizedException()

    // 세션 유효하면 req.user에 유저 id 주입
    const userIdInNumber = Number(session.user.id) // DB의 user.id를 number로 형변환
    if (isNaN(userIdInNumber)) {
      // 반환값이 NaN인지 확인
      throw new UnauthorizedException('Invalid userId')
    }
    req.user = { id: userIdInNumber } // req 객체에 user 프로퍼티 추가해주기
    return true
  }
}
