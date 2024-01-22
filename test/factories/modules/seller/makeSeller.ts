import { fakerPT_BR } from '@faker-js/faker'
import {
  CollaboratorCreatePropsOptional,
  CollaboratorRole,
} from '@modules/collaborator/entities/Collaborator'
import { Seller } from '@modules/seller/entities/Seller'
import { UniqueEntityId } from '@shared/core/valueObjects/UniqueEntityId'

export function makeSeller(
  override: Partial<
    CollaboratorCreatePropsOptional<CollaboratorRole.SELLER>
  > = {},
  id?: UniqueEntityId,
): Seller {
  const seller = Seller.create(
    {
      email: fakerPT_BR.internet.email(),
      actualRemuneration: fakerPT_BR.number.int(),
      marketId: new UniqueEntityId(),
      userId: new UniqueEntityId(),
      password: fakerPT_BR.internet.password(),
      ...override,
    },
    id,
  )

  return seller
}

// @Injectable()
// export class MakeSeller {
//   constructor(private readonly prisma: PrismaService) {}

//   async create(
//     override: Partial<
//       CollaboratorCreatePropsOptional<CollaboratorRole.SELLER>
//     > = {},
//     id?: UniqueEntityId,
//   ) {
//     const seller = makeSeller(override, id)

//     await this.prisma.collaborator.create({
//       data: SellersPrismaMapper.toPrisma(seller),
//     })

//     return seller
//   }
// }
