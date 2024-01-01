import { ServiceError } from '@shared/core/error/ServiceError'

export class AttendantAlreadyExistsWithSame
  extends Error
  implements ServiceError
{
  status = 400

  constructor(value: string) {
    super(`Attendant already exist with same ${value}`)
  }
}
