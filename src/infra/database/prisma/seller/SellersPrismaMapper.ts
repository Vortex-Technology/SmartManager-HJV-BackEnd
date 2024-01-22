import { CollaboratorRole } from '@modules/collaborator/entities/Collaborator'
import { Seller } from '@modules/seller/entities/Seller'
import {
  Prisma,
  RoleCollaborator,
  Collaborator as SellerPrisma,
} from '@prisma/client'
import { UniqueEntityId } from '@shared/core/valueObjects/UniqueEntityId'

export class SellersPrismaMapper {
  static toEntity(raw: SellerPrisma): Seller {
    if (!raw.marketId) {
      throw new Error('Market not exist in seller')
    }

    return Seller.create(
      {
        actualRemuneration: raw.actualRemuneration,
        email: raw.email,
        marketId: new UniqueEntityId(raw.marketId),
        userId: new UniqueEntityId(raw.userId),
        inactivatedAt: raw.inactivatedAt,
        role: raw.role as CollaboratorRole,
        password: raw.password,
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
        deletedAt: raw.deletedAt,
      },
      new UniqueEntityId(raw.id),
    )
  }

  static toPrisma(seller: Seller): Prisma.CollaboratorUncheckedCreateInput {
    if (!seller.marketId) {
      throw new Error('Market not exist in seller')
    }

    return {
      actualRemuneration: seller.actualRemuneration,
      email: seller.email,
      marketId: seller.marketId.toString(),
      userId: seller.userId.toString(),
      inactivatedAt: seller.inactivatedAt,
      password: seller.password,
      role: seller.role as RoleCollaborator,
      id: seller.id.toString(),
      createdAt: seller.createdAt,
      updatedAt: seller.updatedAt,
      deletedAt: seller.deletedAt,
    }
  }
}
