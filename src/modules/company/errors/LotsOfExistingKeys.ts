import { ServiceError } from '@shared/core/error/ServiceError'

export class LotsOfExistingKeys extends Error implements ServiceError {
  status = 409

  constructor() {
    super('Lots of existing keys')
  }
}
