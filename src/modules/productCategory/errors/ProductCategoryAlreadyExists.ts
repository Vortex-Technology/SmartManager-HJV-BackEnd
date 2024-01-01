import { ServiceError } from '@shared/core/error/ServiceError'

export class ProductCategoryAlreadyExists
  extends Error
  implements ServiceError
{
  status = 409

  constructor() {
    super(`Product category already exist`)
  }
}
