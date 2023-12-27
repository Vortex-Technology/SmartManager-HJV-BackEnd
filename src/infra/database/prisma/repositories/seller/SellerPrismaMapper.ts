import { Seller } from '@modules/seller/entities/Seller'
import { Prisma, Collaborator as SellerPrisma } from '@prisma/client'
import { UniqueEntityId } from '@shared/core/entities/valueObjects/UniqueEntityId'

export class SellerPrismaMapper {
  static toEntity(raw: SellerPrisma): Seller {
    return Seller.create(
      {
        login: raw.login,
        name: raw.name,
        password: raw.password,
        image: raw.image,
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
        deletedAt: raw.deletedAt,
      },
      new UniqueEntityId(raw.id),
    )
  }

  static toPrisma(seller: Seller): Prisma.CollaboratorUncheckedCreateInput {
    return {
      login: seller.login,
      name: seller.name,
      password: seller.password,
      id: seller.id.toString(),
      image: seller.image,
      type: 'SELLER',
      createdAt: seller.createdAt,
      updatedAt: seller.updatedAt,
      deletedAt: seller.deletedAt,
    }
  }
}
