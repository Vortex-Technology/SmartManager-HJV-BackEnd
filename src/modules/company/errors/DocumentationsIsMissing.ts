import { ServiceError } from '@shared/core/error/ServiceError'

export class DocumentationsIsMissing extends Error implements ServiceError {
  status = 409

  constructor() {
    super('Please provide all teh documentation to create a new company')
  }
}
