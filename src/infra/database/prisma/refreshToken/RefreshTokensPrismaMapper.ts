import { RefreshToken } from '@modules/refreshToken/entities/RefreshToken'
import { Prisma, RefreshToken as RefreshTokenPrisma } from '@prisma/client'
import { UniqueEntityId } from '@shared/core/entities/valueObjects/UniqueEntityId'

export class RefreshTokensPrismaMapper {
  static toEntity(raw: RefreshTokenPrisma): RefreshToken {
    return RefreshToken.create(
      {
        collaboratorId: new UniqueEntityId(raw.userId),
        expiresIn: raw.expiresIn,
        token: raw.token,
        createdAt: raw.createdAt,
        expiredAt: raw.expiredAt,
      },
      new UniqueEntityId(raw.id),
    )
  }

  static toPrisma(
    refreshToken: RefreshToken,
  ): Prisma.RefreshTokenUncheckedCreateInput {
    return {
      expiresIn: refreshToken.expiresIn,
      token: refreshToken.token,
      userId: refreshToken.collaboratorId.toString(),
      createdAt: refreshToken.createdAt,
      expiredAt: refreshToken.expiredAt,
      id: refreshToken.id.toString(),
    }
  }
}
