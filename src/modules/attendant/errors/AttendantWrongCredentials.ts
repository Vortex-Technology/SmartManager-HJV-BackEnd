import { ServiceError } from '@shared/core/error/ServiceError'

export class AttendantWrongCredentials extends Error implements ServiceError {
  status = 403

  constructor() {
    super('Your login or password does not match')
  }
}
