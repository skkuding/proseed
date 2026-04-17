import { BetterAuthService } from '../better-auth.service'
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { fromNodeHeaders } from 'better-auth/node'

@Injectable()
export class BetterAuthGuard implements CanActivate {
  constructor(private readonly betterAuthService: BetterAuthService) {}
  //요청 헤더에서 세션 쿠키 존재하는지 확인
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest()
    const session = await this.betterAuthService.auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    })

    if (!session) throw new UnauthorizedException()

    const userIdInNumber = Number(session.user.id) //user.id number로 형변환
    if (isNaN(userIdInNumber)) {
      //반환값이 NAN인지 확인
      throw new UnauthorizedException('Invalid userId')
    }
    req.user = { id: userIdInNumber }
    return true
  }
}
