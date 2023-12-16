import { fakerPT_BR } from '@faker-js/faker'
import { PrismaService } from '@infra/database/prisma/index.service'
import { AdministratorPrismaMapper } from '@infra/database/prisma/repositories/administrator/AdministratorPrismaMapper'
import {
  Administrator,
  AdministratorProps,
} from '@modules/administrator/entities/Administrator'
import { Injectable } from '@nestjs/common'
import { UniqueEntityId } from '@shared/core/entities/valueObjects/UniqueEntityId'

export function makeAdministrator(
  override: Partial<AdministratorProps> = {},
  id?: UniqueEntityId,
): Administrator {
  const administrator = Administrator.create(
    {
      login: fakerPT_BR.person.firstName(),
      name: fakerPT_BR.person.fullName(),
      password: fakerPT_BR.internet.password(),
      ...override,
    },
    id,
  )

  return administrator
}

@Injectable()
export class MakeAdministrator {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    override: Partial<AdministratorProps> = {},
    id?: UniqueEntityId,
  ) {
    const administrator = makeAdministrator(override, id)

    await this.prisma.administrator.create({
      data: AdministratorPrismaMapper.toPrisma(administrator),
    })

    return administrator
  }
}
