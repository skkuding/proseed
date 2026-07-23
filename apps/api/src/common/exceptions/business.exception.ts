import {
  UnauthorizedException,
  type HttpException,
  NotFoundException,
  ConflictException,
  UnprocessableEntityException,
  ForbiddenException,
} from '@nestjs/common/exceptions'

export abstract class BusinessException extends Error {
  name: string

  constructor(message: string) {
    super(message)
    this.name = this.constructor.name
  }

  abstract convert2HTTPException(message?: string): HttpException
}

/** [401] Throw when a user cannot be identified with given credential. */
export class UnidentifiedException extends BusinessException {
  constructor(credential) {
    super(`Incorrect ${credential}`)
  }

  convert2HTTPException(message?: string) {
    return new UnauthorizedException(message ?? this.message)
  }
}

/** [401] Throw when JWT token is invalid. */
export class InvalidJwtTokenException extends BusinessException {
  constructor(message) {
    super(`Invalid token: ${message}`)
  }

  convert2HTTPException(message?: string) {
    return new UnauthorizedException(message ?? this.message)
  }
}

/** [404] Throw when requested entity is not found. */
export class EntityNotExistException extends BusinessException {
  constructor(entity) {
    super(`${entity} does not exist`)
  }

  convert2HTTPException(message?: string) {
    return new NotFoundException(message ?? this.message)
  }
}

/** [409] Throw when the request has a conflict with relevant entities.
 * e.g., participation is not allowed to ended contest.
 */
export class ConflictFoundException extends BusinessException {
  convert2HTTPException(message?: string) {
    return new ConflictException(message ?? this.message)
  }
}

/** [409] Throw when the request has a conflict with relevant entities.
 * e.g., group name is already in use
 */
export class DuplicateFoundException extends ConflictFoundException {
  constructor(entity) {
    super(`${entity} is already in use`)
  }
}

/** [422] Throw when data is invalid or cannot be processed. */
export class UnprocessableDataException extends BusinessException {
  convert2HTTPException(message?: string) {
    return new UnprocessableEntityException(message ?? this.message)
  }
}

/** [422] Throw when file data is invalid or cannot be processed. */
export class UnprocessableFileDataException extends UnprocessableDataException {
  constructor(message, fileName) {
    super(`${message} @${fileName}`)
  }
}

/**
 * [422] 티켓 잔액 부족. 응답 body에 안정적인 `code`를 실어
 * FE가 message 문자열 매칭 없이 다른 422와 구분할 수 있게 한다.
 */
export class InsufficientTicketException extends UnprocessableDataException {
  static readonly CODE = 'INSUFFICIENT_TICKET'

  constructor(message = 'Not enough tickets.') {
    super(message)
  }

  convert2HTTPException(message?: string) {
    return new UnprocessableEntityException({
      statusCode: 422,
      error: 'Unprocessable Entity',
      code: InsufficientTicketException.CODE,
      message: message ?? this.message,
    })
  }
}

/** [403] Throw when request cannot be carried due to lack of permission. */
export class ForbiddenAccessException extends BusinessException {
  convert2HTTPException(message?: string) {
    return new ForbiddenException(message ?? this.message)
  }
}
