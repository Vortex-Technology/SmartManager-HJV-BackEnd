import { fakerPT_BR } from '@faker-js/faker'
import { PrismaService } from '@infra/database/prisma/index.service'
import { MarketsPrismaMapper } from '@infra/database/prisma/market/MarketsPrismaMapper'
import { Market, MarketProps } from '@modules/market/entities/Market'
import { Injectable } from '@nestjs/common'
import { UniqueEntityId } from '@shared/core/valueObjects/UniqueEntityId'
import { makeAddress } from '@test/factories/valueObjects/address/makeAddress'

export function makeMarket(
  override: Partial<MarketProps> = {},
  id?: UniqueEntityId,
): Market {
  const market = Market.create(
    {
      tradeName: fakerPT_BR.company.name(),
      companyId: new UniqueEntityId(),
      inventoryId: new UniqueEntityId(),
      address: makeAddress(),
      ...override,
    },
    id,
  )

  return market
}

@Injectable()
export class MakeMarket {
  constructor(private readonly prisma: PrismaService) {}

  async create(override: Partial<MarketProps> = {}, id?: UniqueEntityId) {
    const market = makeMarket(override, id)

    await this.prisma.market.create({
      data: MarketsPrismaMapper.toCreatePrisma(market),
    })

    return market
  }
}
