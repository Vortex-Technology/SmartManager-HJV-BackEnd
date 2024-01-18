import { ServiceError } from '@shared/core/error/ServiceError'

export class MissingInformations extends Error implements ServiceError {
  status = 409

  constructor(informations: string) {
    super(`Missing informations... ${informations}`)
  }
}
