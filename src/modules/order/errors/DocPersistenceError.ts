import { statusCode } from '@config/statusCode'
import { ServiceError } from '@shared/core/error/ServiceError'

export class DocPersistenceError extends Error implements ServiceError {
  status: number = statusCode.InternalServerError

  constructor() {
    super('Some error occurred when generate doc')
  }
}
