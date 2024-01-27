import { RefreshTokenCollaborator } from '@modules/refreshToken/entities/RefreshTokenCollaborator'
import {
  Prisma,
  RefreshTokenCollaborator as RefreshTokenCollaboratorPrisma,
} from '@prisma/client'
import { UniqueEntityId } from '@shared/core/valueObjects/UniqueEntityId'

export class RefreshTokensCollaboratorsPrismaMapper {
  static toEntity(
    raw: RefreshTokenCollaboratorPrisma,
  ): RefreshTokenCollaborator {
    return RefreshTokenCollaborator.create(
      {
        collaboratorId: new UniqueEntityId(raw.collaboratorId),
        companyId: new UniqueEntityId(raw.companyId),
        marketId: new UniqueEntityId(raw.marketId),
        apiKeyId: new UniqueEntityId(raw.apiKeyId),
        expiresIn: raw.expiresIn,
        token: raw.token,
        createdAt: raw.createdAt,
        expiredAt: raw.expiredAt,
      },
      new UniqueEntityId(raw.id),
    )
  }

  static toPrisma(
    refreshTokenCollaborator: RefreshTokenCollaborator,
  ): Prisma.RefreshTokenCollaboratorUncheckedCreateInput {
    return {
      expiresIn: refreshTokenCollaborator.expiresIn,
      token: refreshTokenCollaborator.token,
      createdAt: refreshTokenCollaborator.createdAt,
      expiredAt: refreshTokenCollaborator.expiredAt,
      id: refreshTokenCollaborator.id.toString(),
      apiKeyId: refreshTokenCollaborator.apiKeyId.toString(),
      collaboratorId: refreshTokenCollaborator.collaboratorId.toString(),
      companyId: refreshTokenCollaborator.companyId.toString(),
      marketId: refreshTokenCollaborator.marketId.toString(),
    }
  }
}
