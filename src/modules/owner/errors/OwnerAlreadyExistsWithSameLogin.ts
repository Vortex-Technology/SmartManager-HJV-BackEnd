import { ServiceError } from '@shared/core/error/ServiceError'

export class OwnerAlreadyExistsWithSameLogin
  extends Error
  implements ServiceError
{
  status = 400

  constructor() {
    super(`Owner already exist with same login`)
  }
}
