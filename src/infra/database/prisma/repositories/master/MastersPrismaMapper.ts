import { Master } from '@modules/master/entities/Master'
import { Collaborator as CollaboratorPrisma, Prisma } from '@prisma/client'
import { UniqueEntityId } from '@shared/core/entities/valueObjects/UniqueEntityId'

export class MastersPrismaMapper {
  static toEntity(raw: CollaboratorPrisma): Master {
    return Master.create(
      {
        login: raw.login,
        name: raw.name,
        password: raw.password,
        createdAt: raw.createdAt,
        deletedAt: raw.deletedAt,
        image: raw.image,
        updatedAt: raw.updatedAt,
      },
      new UniqueEntityId(raw.id),
    )
  }

  static toPrisma(master: Master): Prisma.CollaboratorUncheckedCreateInput {
    return {
      login: master.login,
      name: master.name,
      password: master.password,
      createdAt: master.createdAt,
      deletedAt: master.deletedAt,
      image: master.image,
      updatedAt: master.updatedAt,
      id: master.id.toString(),
      role: master.role,
    }
  }
}
