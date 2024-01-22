import { ApiKey } from '@modules/company/entities/ApiKey'
import { ApiKeysRepository } from '@modules/company/repositories/ApiKeysRepository'

export class ApiKeysInMemoryRepository implements ApiKeysRepository {
  apiKeys: ApiKey[] = []

  async create(apiKey: ApiKey): Promise<void> {
    this.apiKeys.push(apiKey)
  }

  async findActivesByCompanyId(companyId: string): Promise<ApiKey[]> {
    return this.apiKeys.filter(
      (apiKey) =>
        apiKey.companyId.toString() === companyId && !apiKey.revokedAt,
    )
  }

  async findByKey(key: string): Promise<ApiKey | null> {
    return this.apiKeys.find((apiKey) => apiKey.key === key) || null
  }
}
