import { ServiceError } from '@shared/core/error/ServiceError'
import { statusCode } from 'src/config/statusCode'

export class ApiKeyIsRevoked extends Error implements ServiceError {
  status = statusCode.Forbidden

  constructor() {
    super('Api key is revoked')
  }
}
