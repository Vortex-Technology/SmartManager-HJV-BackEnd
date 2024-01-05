import { ServiceError } from '@shared/core/error/ServiceError'
import { statusCode } from 'src/config/statusCode'

export class SessionExpired extends Error implements ServiceError {
  status = statusCode.Unauthorized

  constructor() {
    super('Session expired')
  }
}
