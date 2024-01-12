import { fakerPT_BR } from '@faker-js/faker'
import { PrismaService } from '@infra/database/prisma/index.service'
import { OwnersPrismaMapper } from '@infra/database/prisma/repositories/owners/OwnersPrismaMapper'
import {
  CollaboratorCreatePropsOptional,
  CollaboratorRole,
} from '@modules/collaborator/entities/Collaborator'
import { Owner } from '@modules/owner/entities/Owner'
import { Injectable } from '@nestjs/common'
import { UniqueEntityId } from '@shared/core/entities/valueObjects/UniqueEntityId'

export function makeOwner(
  override: Partial<
    CollaboratorCreatePropsOptional<CollaboratorRole.OWNER>
  > = {},
  id?: UniqueEntityId,
): Owner {
  const owner = Owner.create(
    {
      login: fakerPT_BR.person.firstName(),
      name: fakerPT_BR.person.fullName(),
      password: fakerPT_BR.internet.password(),
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
      CollaboratorCreatePropsOptional<CollaboratorRole.OWNER>
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
