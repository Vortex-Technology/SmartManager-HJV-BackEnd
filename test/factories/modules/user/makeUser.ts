import { fakerPT_BR } from '@faker-js/faker'
import { PrismaService } from '@infra/database/prisma/index.service'
import { UsersPrismaMapper } from '@infra/database/prisma/user/UsersPrismaMapper'
import { User, UserProps } from '@modules/user/entities/User'
import { Injectable } from '@nestjs/common'
import { UniqueEntityId } from '@shared/core/valueObjects/UniqueEntityId'

export function makeUser(
  override: Partial<UserProps> = {},
  id?: UniqueEntityId,
): User {
  const user = User.create(
    {
      email: fakerPT_BR.internet.email(),
      name: fakerPT_BR.person.fullName(),
      password: fakerPT_BR.internet.password(),
      ...override,
    },
    id,
  )

  return user
}

@Injectable()
export class MakeUser {
  constructor(private readonly prisma: PrismaService) {}

  async create(override: Partial<UserProps> = {}, id?: UniqueEntityId) {
    const user = makeUser(override, id)

    await this.prisma.user.create({
      data: UsersPrismaMapper.toPrisma(user),
    })

    return user
  }
}
