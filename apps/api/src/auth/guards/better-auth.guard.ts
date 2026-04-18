import { BetterAuthService } from '../better-auth.service'
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { fromNodeHeaders } from 'better-auth/node'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class BetterAuthGuard implements CanActivate {
  constructor(
    private readonly betterAuthService: BetterAuthService,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest()

    /**
     * [로컬 개발 환경 전용]
     * 브루노(Bruno), 포스트맨 등 API 테스트 도구에서 소셜 로그인 세션을 매번 생성하기 번거로우므로,
     * NODE_ENV가 'development'인 경우에 한해 임시로 ID가 1인 유저로 인증을 승인합니다.
     * 실제 운영(production) 환경에서는 이 로직이 작동하지 않으며 정상적인 세션 체크를 수행합니다.
     */
    if (this.configService.get('NODE_ENV') === 'development') {
      req.user = { id: 1 }
      return true
    }

    // 요청 헤더에서 세션 쿠키 존재하는지 확인
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
