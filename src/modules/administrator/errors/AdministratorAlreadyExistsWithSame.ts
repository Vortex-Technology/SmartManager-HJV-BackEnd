import { ServiceError } from '@shared/core/error/ServiceError'

export class AdministratorAlreadyExistsWithSame
  extends Error
  implements ServiceError
{
  status = 400

  constructor(value: string) {
    super(`Administrator already exist with same ${value}`)
  }
}
