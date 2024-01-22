import { ApiKey } from '../entities/ApiKey'

export class ApiKeyPresenter {
  static toHTTP(apiKey: ApiKey) {
    return {
      key: apiKey.key,
    }
  }
}
