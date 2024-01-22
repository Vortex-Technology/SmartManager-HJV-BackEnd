import { ServiceError } from '@shared/core/error/ServiceError'

export class InsufficientMarkets extends Error implements ServiceError {
  status = 409

  constructor() {
    super('Please provide at least one market to create a new company')
  }
}
