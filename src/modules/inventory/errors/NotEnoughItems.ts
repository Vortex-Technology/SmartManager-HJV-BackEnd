import { statusCode } from '@config/statusCode'
import { ServiceError } from '@shared/core/error/ServiceError'

export class NotEnoughItems extends Error implements ServiceError {
  status: number = statusCode.Conflict

  constructor() {
    super('Not enough items')
  }
}
