import { ServiceError } from '@shared/core/error/ServiceError'

export class UserNotFount extends Error implements ServiceError {
  status = 409

  constructor() {
    super('User not found')
  }
}
