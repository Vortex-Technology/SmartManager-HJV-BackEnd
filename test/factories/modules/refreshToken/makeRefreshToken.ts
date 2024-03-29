import { fakerPT_BR } from '@faker-js/faker'
import { PrismaService } from '@infra/database/prisma/index.service'
import { RefreshTokensPrismaMapper } from '@infra/database/prisma/refreshToken/RefreshTokensPrismaMapper'
import {
  RefreshToken,
  RefreshTokenProps,
} from '@modules/refreshToken/entities/RefreshToken'
import { Injectable } from '@nestjs/common'
import { UniqueEntityId } from '@shared/core/valueObjects/UniqueEntityId'

export function makeRefreshToken(
  override: Partial<RefreshTokenProps> = {},
  id?: UniqueEntityId,
): RefreshToken {
  const attendant = RefreshToken.create(
    {
      collaboratorId: new UniqueEntityId(),
      expiresIn: fakerPT_BR.date.future(),
      token: fakerPT_BR.internet.password(),
      ...override,
    },
    id,
  )

  return attendant
}

@Injectable()
export class MakeRefreshToken {
  constructor(private readonly prisma: PrismaService) {}

  async create(override: Partial<RefreshTokenProps> = {}, id?: UniqueEntityId) {
    const refreshToken = makeRefreshToken(override, id)

    await this.prisma.refreshToken.create({
      data: RefreshTokensPrismaMapper.toPrisma(refreshToken),
    })

    return refreshToken
  }
}
