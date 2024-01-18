import { ApiKey } from '../entities/ApiKey'

export abstract class ApiKeysRepository {
  abstract create(apiKey: ApiKey): Promise<void>
  abstract findActivesByCompanyId(companyId: string): Promise<ApiKey[]>
  abstract findByKey(key: string): Promise<ApiKey | null>
}
