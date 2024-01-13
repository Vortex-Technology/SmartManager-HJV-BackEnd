import { ServiceError } from '@shared/core/error/ServiceError'

export class OwnerNotFount extends Error implements ServiceError {
  status = 400

  constructor() {
    super('Owner not found')
  }
}
