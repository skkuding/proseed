import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common'
import type { Response } from 'express'
import { BusinessException } from '../exceptions/business.exception'

/** BusinessException을 의도된 HTTP status(404/403/409/422 등)로 변환 */
@Catch(BusinessException)
export class BusinessExceptionFilter implements ExceptionFilter {
  catch(exception: BusinessException, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>()
    const httpException = exception.convert2HTTPException()
    response.status(httpException.getStatus()).json(httpException.getResponse())
  }
}
