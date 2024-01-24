import { fakerPT_BR } from '@faker-js/faker'
import { ApiKeysPrismaMapper } from '@infra/database/prisma/company/ApiKeysPrismaMapper'
import { PrismaService } from '@infra/database/prisma/index.service'
import { ApiKey, ApiKeyProps } from '@modules/company/entities/ApiKey'
import { Injectable } from '@nestjs/common'
import { UniqueEntityId } from '@shared/core/valueObjects/UniqueEntityId'

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

@Injectable()
export class MakeApiKey {
  constructor(private readonly prisma: PrismaService) {}

  async create(override: Partial<ApiKeyProps> = {}, id?: UniqueEntityId) {
    const company = makeApiKey(override, id)

    await this.prisma.apiKey.create({
      data: ApiKeysPrismaMapper.toPrisma(company),
    })

    return company
  }
}
