import { ServiceError } from '@shared/core/error/ServiceError'

export class AttendantNotFount extends Error implements ServiceError {
  status = 400

  constructor() {
    super('Attendant not found')
  }
}
