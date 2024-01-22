import { ApiKey } from '@modules/company/entities/ApiKey'
import { Prisma, ApiKey as ApiKeyPrisma } from '@prisma/client'
import { UniqueEntityId } from '@shared/core/valueObjects/UniqueEntityId'

export class ApiKeysPrismaMapper {
  static toEntity(raw: ApiKeyPrisma): ApiKey {
    return ApiKey.create(
      {
        companyId: new UniqueEntityId(raw.companyId),
        key: raw.key,
        secret: raw.secret,
        revokedAt: raw.revokedAt,
      },
      new UniqueEntityId(raw.id),
    )
  }

  static toPrisma(apiKey: ApiKey): Prisma.ApiKeyUncheckedCreateInput {
    return {
      companyId: apiKey.companyId.toString(),
      key: apiKey.key,
      secret: apiKey.secret,
      id: apiKey.id.toString(),
      revokedAt: apiKey.revokedAt,
    }
  }
}
