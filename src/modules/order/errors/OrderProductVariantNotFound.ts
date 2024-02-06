import { statusCode } from '@config/statusCode'
import { ServiceError } from '@shared/core/error/ServiceError'

export class OrderProductVariantNotFound extends Error implements ServiceError {
  status: number = statusCode.NotFound

  constructor() {
    super('Order product variant not found')
  }
}
