import { ServiceError } from '@shared/core/error/ServiceError'

export class SellerNotFount extends Error implements ServiceError {
  status = 400

  constructor() {
    super('Seller not found')
  }
}
