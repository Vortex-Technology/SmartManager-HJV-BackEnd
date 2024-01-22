import { ServiceError } from '@shared/core/error/ServiceError'

export class AllProductVariantAlreadyExists
  extends Error
  implements ServiceError
{
  status = 409

  constructor() {
    super(`All product variants already exist`)
  }
}
