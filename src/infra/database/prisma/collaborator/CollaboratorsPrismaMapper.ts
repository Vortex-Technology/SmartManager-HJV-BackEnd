import {
  Collaborator,
  CollaboratorRole,
} from '@modules/collaborator/entities/Collaborator'
import {
  Collaborator as CollaboratorPrisma,
  Prisma,
  RoleCollaborator,
} from '@prisma/client'
import { UniqueEntityId } from '@shared/core/entities/valueObjects/UniqueEntityId'

export class CollaboratorsPrismaMapper {
  static toEntity(raw: CollaboratorPrisma): Collaborator {
    return Collaborator.createUntyped(
      {
        email: raw.email,
        password: raw.password,
        createdAt: raw.createdAt,
        deletedAt: raw.deletedAt,
        actualRemuneration: raw.actualRemuneration,
        marketId: new UniqueEntityId(raw.marketId),
        userId: new UniqueEntityId(raw.userId),
        inactivatedAt: raw.inactivatedAt,
        updatedAt: raw.updatedAt,
        role: raw.role as CollaboratorRole,
      },
      new UniqueEntityId(raw.id),
    )
  }

  static toPrisma(
    collaborator: Collaborator,
  ): Prisma.CollaboratorUncheckedCreateInput {
    return {
      id: collaborator.id.toString(),
      email: collaborator.email,
      password: collaborator.password,
      createdAt: collaborator.createdAt,
      deletedAt: collaborator.deletedAt,
      actualRemuneration: collaborator.actualRemuneration,
      marketId: collaborator.marketId.toString(),
      userId: collaborator.userId.toString(),
      inactivatedAt: collaborator.inactivatedAt,
      updatedAt: collaborator.updatedAt,
      role: collaborator.role as RoleCollaborator,
    }
  }
}
