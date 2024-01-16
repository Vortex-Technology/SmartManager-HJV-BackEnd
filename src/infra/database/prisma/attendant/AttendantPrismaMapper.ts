import { Attendant } from '@modules/attendant/entities/Attendant'
import { Prisma, Collaborator as AttendantPrisma } from '@prisma/client'
import { UniqueEntityId } from '@shared/core/entities/valueObjects/UniqueEntityId'

export class AttendantPrismaMapper {
  static toEntity(raw: AttendantPrisma): Attendant {
    return Attendant.create(
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

  static toPrisma(
    attendant: Attendant,
  ): Prisma.CollaboratorUncheckedCreateInput {
    return {
      login: attendant.login,
      name: attendant.name,
      password: attendant.password,
      id: attendant.id.toString(),
      image: attendant.image,
      type: 'ATTENDANT',
      createdAt: attendant.createdAt,
      updatedAt: attendant.updatedAt,
      deletedAt: attendant.deletedAt,
    }
  }
}
