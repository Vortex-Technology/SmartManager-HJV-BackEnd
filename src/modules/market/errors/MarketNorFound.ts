import { ServiceError } from '@shared/core/error/ServiceError'

export class MarketNotFound extends Error implements ServiceError {
  status = 404
  constructor() {
    super('Market not found')
  }
}
