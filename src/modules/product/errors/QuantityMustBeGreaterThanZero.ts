import { statusCode } from '@config/statusCode'
import { ServiceError } from '@shared/core/error/ServiceError'

export class QuantityMustBeGreaterThanZero
  extends Error
  implements ServiceError
{
  status: number = statusCode.Conflict

  constructor() {
    super('Quantity must be greater than zero')
  }
}
