import { statusCode } from '@config/statusCode'
import { ServiceError } from '@shared/core/error/ServiceError'

export class PriceMustBeGreaterThanZero extends Error implements ServiceError {
  status: number = statusCode.Conflict

  constructor() {
    super('Price must be greater than zero')
  }
}
