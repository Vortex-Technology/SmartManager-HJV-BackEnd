import { fakerPT_BR } from '@faker-js/faker'
import { PrismaService } from '@infra/database/prisma/index.service'
import { MastersPrismaMapper } from '@infra/database/prisma/master/MastersPrismaMapper'
import {
  CollaboratorCreatePropsOptional,
  CollaboratorRole,
} from '@modules/collaborator/entities/Collaborator'
import { Master } from '@modules/master/entities/Master'
import { Injectable } from '@nestjs/common'
import { UniqueEntityId } from '@shared/core/entities/valueObjects/UniqueEntityId'

export function makeMaster(
  override: Partial<
    CollaboratorCreatePropsOptional<CollaboratorRole.MASTER>
  > = {},
  id?: UniqueEntityId,
): Master {
  const master = Master.create(
    {
      login: fakerPT_BR.person.firstName(),
      name: fakerPT_BR.person.fullName(),
      password: fakerPT_BR.internet.password(),
      ...override,
    },
    id,
  )

  return master
}

@Injectable()
export class MakeMaster {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    override: Partial<
      CollaboratorCreatePropsOptional<CollaboratorRole.MASTER>
    > = {},
    id?: UniqueEntityId,
  ) {
    const master = makeMaster(override, id)

    await this.prisma.collaborator.create({
      data: MastersPrismaMapper.toPrisma(master),
    })

    return master
  }
}
