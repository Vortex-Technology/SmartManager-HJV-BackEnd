import { RefreshAttendantToken } from '@modules/attendant/entities/RefreshAttendantToken'
import { Prisma, RefreshToken } from '@prisma/client'
import { UniqueEntityId } from '@shared/core/entities/valueObjects/UniqueEntityId'

export class RefreshAttendantTokenPrismaMapper {
  static toEntity(raw: RefreshToken): RefreshAttendantToken {
    return RefreshAttendantToken.create(
      {
        attendantId: new UniqueEntityId(raw.collaboratorId!),
        expiresIn: raw.expiresIn,
        token: raw.token,
        createdAt: raw.createdAt,
        expiredAt: raw.expiredAt,
      },
      new UniqueEntityId(raw.id),
    )
  }

  static toPrisma(
    refreshAttendantToken: RefreshAttendantToken,
  ): Prisma.RefreshTokenUncheckedCreateInput {
    return {
      expiresIn: refreshAttendantToken.expiresIn,
      token: refreshAttendantToken.token,
      collaboratorId: refreshAttendantToken.attendantId.toString(),
      createdAt: refreshAttendantToken.createdAt,
      expiredAt: refreshAttendantToken.expiredAt,
      id: refreshAttendantToken.id.toString(),
    }
  }
}
