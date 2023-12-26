import { RefreshAdministratorToken } from '@modules/administrator/entities/RefreshAdministratorToken'
import { Prisma, RefreshToken } from '@prisma/client'
import { UniqueEntityId } from '@shared/core/entities/valueObjects/UniqueEntityId'

export class RefreshAdministratorTokenPrismaMapper {
  static toEntity(raw: RefreshToken): RefreshAdministratorToken {
    return RefreshAdministratorToken.create(
      {
        administratorId: new UniqueEntityId(raw.collaboratorId!),
        expiresIn: raw.expiresIn,
        token: raw.token,
        createdAt: raw.createdAt,
        expiredAt: raw.expiredAt,
      },
      new UniqueEntityId(raw.id),
    )
  }

  static toPrisma(
    refreshAdministratorToken: RefreshAdministratorToken,
  ): Prisma.RefreshTokenUncheckedCreateInput {
    return {
      expiresIn: refreshAdministratorToken.expiresIn,
      token: refreshAdministratorToken.token,
      collaboratorId: refreshAdministratorToken.administratorId.toString(),
      createdAt: refreshAdministratorToken.createdAt,
      expiredAt: refreshAdministratorToken.expiredAt,
      id: refreshAdministratorToken.id.toString(),
    }
  }
}
