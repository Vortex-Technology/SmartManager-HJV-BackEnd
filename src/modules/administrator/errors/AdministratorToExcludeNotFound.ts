import { ServiceError } from '@shared/core/error/ServiceError'

export class AdministratorToExcludeNotFound
  extends Error
  implements ServiceError
{
  status = 400

  constructor() {
    super('Administrator to exclude not found')
  }
}
