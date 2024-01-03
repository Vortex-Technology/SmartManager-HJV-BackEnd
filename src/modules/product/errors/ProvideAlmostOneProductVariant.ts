import { ServiceError } from '@shared/core/error/ServiceError'

export class ProvideAtLeastOneProductVariant
  extends Error
  implements ServiceError
{
  status = 409

  constructor() {
    super(`Please provide at least one product variant`)
  }
}
