import { ServiceError } from '@shared/core/error/ServiceError'

export class ProductVariantAlreadyExistsWithSame
  extends Error
  implements ServiceError
{
  status = 409

  constructor(value: string) {
    super(`Product variant already exist with same ${value}`)
  }
}
