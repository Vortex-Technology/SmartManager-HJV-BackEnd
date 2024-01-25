import { ServiceError } from '@shared/core/error/ServiceError'
import { statusCode } from '@config/statusCode'

export class CollaboratorNotFound extends Error implements ServiceError {
  status = statusCode.Conflict

  constructor(collaboratorType?: string) {
    super(`${collaboratorType || 'Collaborator'} not found`)
  }
}
