import { statusCode } from '@config/statusCode'
import { ServiceError } from '@shared/core/error/ServiceError'

export class ProductVariantInventoryNotFound
  extends Error
  implements ServiceError
{
  status: number = statusCode.NotFound

  constructor() {
    super('Product variant inventory not found')
  }
}
