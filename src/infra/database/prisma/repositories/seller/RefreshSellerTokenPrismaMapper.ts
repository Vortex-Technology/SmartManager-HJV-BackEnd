import { RefreshSellerToken } from '@modules/seller/entities/RefreshSellerToken'
import { Prisma, RefreshToken } from '@prisma/client'
import { UniqueEntityId } from '@shared/core/entities/valueObjects/UniqueEntityId'

export class RefreshSellerTokenPrismaMapper {
  static toEntity(raw: RefreshToken): RefreshSellerToken {
    return RefreshSellerToken.create(
      {
        sellerId: new UniqueEntityId(raw.collaboratorId!),
        expiresIn: raw.expiresIn,
        token: raw.token,
        createdAt: raw.createdAt,
        expiredAt: raw.expiredAt,
      },
      new UniqueEntityId(raw.id),
    )
  }

  static toPrisma(
    refreshSellerToken: RefreshSellerToken,
  ): Prisma.RefreshTokenUncheckedCreateInput {
    return {
      expiresIn: refreshSellerToken.expiresIn,
      token: refreshSellerToken.token,
      collaboratorId: refreshSellerToken.sellerId.toString(),
      createdAt: refreshSellerToken.createdAt,
      expiredAt: refreshSellerToken.expiredAt,
      id: refreshSellerToken.id.toString(),
    }
  }
}
