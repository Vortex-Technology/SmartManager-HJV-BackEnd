import { statusCode } from '@config/statusCode'
import { ServiceError } from '@shared/core/error/ServiceError'

export class OrderNotFound extends Error implements ServiceError {
  status: number = statusCode.NoContent

  constructor() {
    super('Order not found')
  }
}
