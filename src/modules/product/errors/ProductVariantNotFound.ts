import { statusCode } from '@config/statusCode'
import { ServiceError } from '@shared/core/error/ServiceError'

export class ProductVariantNotFound extends Error implements ServiceError {
  status: number = statusCode.NotFound

  constructor() {
    super('Product variant not found')
  }
}
