import { Owner } from '@modules/owner/entities/Owner'
import { Collaborator as CollaboratorPrisma, Prisma } from '@prisma/client'
import { UniqueEntityId } from '@shared/core/entities/valueObjects/UniqueEntityId'

export class OwnersPrismaMapper {
  static toEntity(raw: CollaboratorPrisma): Owner {
    return Owner.create(
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

  static toPrisma(owner: Owner): Prisma.CollaboratorUncheckedCreateInput {
    return {
      login: owner.login,
      name: owner.name,
      password: owner.password,
      createdAt: owner.createdAt,
      deletedAt: owner.deletedAt,
      id: owner.id.toString(),
      image: owner.image,
      role: owner.role,
      updatedAt: owner.updatedAt,
    }
  }
}
