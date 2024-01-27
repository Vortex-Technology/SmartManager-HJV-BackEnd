import { statusCode } from '@config/statusCode'
import { ServiceError } from '@shared/core/error/ServiceError'

export class ProductNotFound extends Error implements ServiceError {
  status: number = statusCode.Conflict

  constructor() {
    super('Product not found')
  }
}
