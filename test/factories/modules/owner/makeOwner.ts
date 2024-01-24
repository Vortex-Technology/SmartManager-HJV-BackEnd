import { fakerPT_BR } from '@faker-js/faker'
import { PrismaService } from '@infra/database/prisma/index.service'
import { OwnersPrismaMapper } from '@infra/database/prisma/owner/OwnersPrismaMapper'
import {
  CollaboratorCreateOwnerPropsOptional,
  CollaboratorRole,
} from '@modules/collaborator/entities/Collaborator'
import { Owner } from '@modules/owner/entities/Owner'
import { Injectable } from '@nestjs/common'
import { UniqueEntityId } from '@shared/core/valueObjects/UniqueEntityId'

export function makeOwner(
  override: Partial<
    CollaboratorCreateOwnerPropsOptional<CollaboratorRole.OWNER>
  > = {},
  id?: UniqueEntityId,
): Owner {
  const owner = Owner.create(
    {
      email: fakerPT_BR.internet.email(),
      actualRemuneration: fakerPT_BR.number.int({ max: 1_000_000 }),
      marketId: new UniqueEntityId(),
      userId: new UniqueEntityId(),
      password: fakerPT_BR.internet.password(),
      companyId: new UniqueEntityId(),
      role: CollaboratorRole.OWNER,
      ...override,
    },
    id,
  )

  return owner
}

@Injectable()
export class MakeOwner {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    override: Partial<
      CollaboratorCreateOwnerPropsOptional<CollaboratorRole.OWNER>
    > = {},
    id?: UniqueEntityId,
  ) {
    const owner = makeOwner(override, id)

    await this.prisma.collaborator.create({
      data: OwnersPrismaMapper.toPrisma(owner),
    })

    return owner
  }
}
