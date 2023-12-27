import { ServiceError } from '@shared/core/error/ServiceError'

export class SellerAlreadyExistsWithSame extends Error implements ServiceError {
  status = 400

  constructor(value: string) {
    super(`Seller already exist with same ${value}`)
  }
}
