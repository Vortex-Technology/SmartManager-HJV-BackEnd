import { ServiceError } from '@shared/core/error/ServiceError'

export class MasterNotFound extends Error implements ServiceError {
  status = 400

  constructor() {
    super('Master not found')
  }
}
