import { ServiceError } from '@shared/core/error/ServiceError'

export class UserAlreadyExistsWithSameEmail
  extends Error
  implements ServiceError
{
  status = 400

  constructor() {
    super(`User already exist with same email`)
  }
}
