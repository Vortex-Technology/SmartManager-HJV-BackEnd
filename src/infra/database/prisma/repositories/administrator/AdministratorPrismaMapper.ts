import {
  Administrator,
  AdministratorRole,
} from '@modules/administrator/entities/Administrator'
import { Prisma, Administrator as AdministratorPrisma } from '@prisma/client'
import { UniqueEntityId } from '@shared/core/entities/valueObjects/UniqueEntityId'

export class AdministratorPrismaMapper {
  static toEntity(raw: AdministratorPrisma): Administrator {
    return Administrator.create(
      {
        login: raw.login,
        name: raw.name,
        password: raw.password,
        image: raw.image,
        role: raw.role as AdministratorRole,
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
      },
      new UniqueEntityId(raw.id),
    )
  }

  static toPrisma(
    administrator: Administrator,
  ): Prisma.AdministratorUncheckedCreateInput {
    return {
      login: administrator.login,
      name: administrator.name,
      password: administrator.password,
      id: administrator.id.toString(),
      image: administrator.image,
      role: administrator.role,
      createdAt: administrator.createdAt,
      updatedAt: administrator.updatedAt,
    }
  }
}
