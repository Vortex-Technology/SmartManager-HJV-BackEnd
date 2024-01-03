import { ServiceError } from '@shared/core/error/ServiceError'

export class ProductErrosPresenter {
  static toHTTP(errors: ServiceError[]) {
    if (errors.length < 1) return undefined

    return {
      errors: errors.map((error) => ({
        message: error.message,
      })),
    }
  }
}
