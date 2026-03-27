import { auth } from '../better-auth'
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { fromNodeHeaders } from 'better-auth/node'

@Injectable()
export class BetterAuthGuard implements CanActivate {
  //요청 헤더에서 세션 쿠키 존재하는지 확인
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest()
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    })

    if (!session) throw new UnauthorizedException()

    req.user = {
      id: Number(session.user.id),
    } //user.id 형변환 (string -> number)
    return true
  }
}
