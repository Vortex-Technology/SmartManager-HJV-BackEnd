import { ServiceError } from '@shared/core/error/ServiceError'
import { statusCode } from 'src/config/statusCode'

export class CollaboratorNotFound extends Error implements ServiceError {
  status = statusCode.Conflict

  constructor(collaboratorType: string) {
    super(`${collaboratorType} not found`)
  }
}
