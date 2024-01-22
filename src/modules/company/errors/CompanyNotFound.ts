import { ServiceError } from '@shared/core/error/ServiceError'

export class CompanyNotFound extends Error implements ServiceError {
  status = 404

  constructor() {
    super('Company not found')
  }
}
