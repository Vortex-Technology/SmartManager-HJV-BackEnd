import { fakerPT_BR } from '@faker-js/faker'
import { Market, MarketProps } from '@modules/market/entities/Market'
import { UniqueEntityId } from '@shared/core/entities/valueObjects/UniqueEntityId'

export function makeMarket(
  override: Partial<MarketProps> = {},
  id?: UniqueEntityId,
): Market {
  const market = Market.create(
    {
      tradeName: fakerPT_BR.company.name(),
      city: fakerPT_BR.location.city(),
      companyId: new UniqueEntityId(),
      neighborhood: fakerPT_BR.location.city(),
      number: fakerPT_BR.location.buildingNumber(),
      postalCode: fakerPT_BR.location.zipCode(),
      state: fakerPT_BR.location.state(),
      street: fakerPT_BR.location.street(),
      inventoryId: new UniqueEntityId(),
      ...override,
    },
    id,
  )

  return market
}

// @Injectable()
// export class MakeMarket {
//   constructor(private readonly prisma: PrismaService) {}

//   async create(
//     override: Partial<
//       CollaboratorCreatePropsOptional<CollaboratorRole.MARKET>
//     > = {},
//     id?: UniqueEntityId,
//   ) {
//     const market = makeMarket(override, id)

//     await this.prisma.collaborator.create({
//       data: MarketsPrismaMapper.toPrisma(market),
//     })

//     return market
//   }
// }
