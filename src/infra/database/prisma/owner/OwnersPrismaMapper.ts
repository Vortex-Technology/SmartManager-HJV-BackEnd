import { CollaboratorRole } from '@modules/collaborator/entities/Collaborator'
import { Owner } from '@modules/owner/entities/Owner'
import { Prisma, Collaborator as OwnerPrisma } from '@prisma/client'
import { UniqueEntityId } from '@shared/core/valueObjects/UniqueEntityId'

export class OwnersPrismaMapper {
  static toEntity(raw: OwnerPrisma): Owner {
    if (!raw.companyId) {
      throw new Error('Company not exist in owner')
    }

    return Owner.create(
      {
        actualRemuneration: raw.actualRemuneration,
        companyId: new UniqueEntityId(raw.companyId),
        email: raw.email,
        password: raw.password,
        userId: new UniqueEntityId(raw.userId),
        createdAt: raw.createdAt,
        deletedAt: raw.deletedAt,
        inactivatedAt: raw.inactivatedAt,
        marketId: raw.marketId ? new UniqueEntityId(raw.marketId) : undefined,
        role: raw.role as CollaboratorRole,
        updatedAt: raw.updatedAt,
      },
      new UniqueEntityId(raw.id),
    )
  }

  static toPrisma(owner: Owner): Prisma.CollaboratorUncheckedCreateInput {
    return {
      actualRemuneration: owner.actualRemuneration,
      email: owner.email,
      password: owner.password,
      userId: owner.userId.toString(),
      companyId: owner.companyId?.toString(),
      createdAt: owner.createdAt,
      deletedAt: owner.deletedAt,
      id: owner.id.toString(),
      inactivatedAt: owner.inactivatedAt,
      marketId: owner.marketId?.toString(),
      role: owner.role,
      updatedAt: owner.updatedAt,
    }
  }
}
