import { fakerPT_BR } from '@faker-js/faker'
import { ApiKey, ApiKeyProps } from '@modules/company/entities/ApiKey'
import { UniqueEntityId } from '@shared/core/entities/valueObjects/UniqueEntityId'

export function makeApiKey(
  override: Partial<ApiKeyProps> = {},
  id?: UniqueEntityId,
) {
  return ApiKey.create(
    {
      companyId: new UniqueEntityId(),
      key: fakerPT_BR.internet.password(),
      secret: fakerPT_BR.internet.password(),
      ...override,
    },
    id,
  )
}
