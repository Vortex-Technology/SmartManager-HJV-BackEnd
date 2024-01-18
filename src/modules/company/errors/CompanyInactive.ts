import { ServiceError } from '@shared/core/error/ServiceError'

export class CompanyInactive extends Error implements ServiceError {
  status = 409

  constructor() {
    super('Company inactive')
  }
}
