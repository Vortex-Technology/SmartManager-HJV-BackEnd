import {
  Collaborator,
  CollaboratorRole,
} from '@modules/collaborator/entities/Collaborator'
import { Collaborator as CollaboratorPrisma } from '@prisma/client'
import { UniqueEntityId } from '@shared/core/entities/valueObjects/UniqueEntityId'

export class CollaboratorsPrismaMapper {
  static toEntity(raw: CollaboratorPrisma): Collaborator {
    return Collaborator.create(
      {
        login: raw.login,
        name: raw.name,
        password: raw.password,
        createdAt: raw.createdAt,
        deletedAt: raw.deletedAt,
        image: raw.image,
        role: raw.role as CollaboratorRole,
      },
      new UniqueEntityId(raw.id),
    )
  }
}
