import { ServiceError } from '@shared/core/error/ServiceError'

export class AdministratorNotFount extends Error implements ServiceError {
  status = 400

  constructor() {
    super('Administrator not found')
  }
}
