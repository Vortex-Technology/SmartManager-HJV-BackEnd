import { ServiceError } from '@shared/core/error/ServiceError'

export class InventoryNotFount extends Error implements ServiceError {
  status = 400

  constructor() {
    super('Inventory not found')
  }
}
