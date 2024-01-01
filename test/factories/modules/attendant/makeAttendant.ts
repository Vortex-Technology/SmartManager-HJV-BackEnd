import { fakerPT_BR } from '@faker-js/faker'
import { PrismaService } from '@infra/database/prisma/index.service'
import { AttendantPrismaMapper } from '@infra/database/prisma/repositories/attendant/AttendantPrismaMapper'
import {
  Attendant,
  AttendantProps,
} from '@modules/attendant/entities/Attendant'
import { Injectable } from '@nestjs/common'
import { UniqueEntityId } from '@shared/core/entities/valueObjects/UniqueEntityId'

export function makeAttendant(
  override: Partial<AttendantProps> = {},
  id?: UniqueEntityId,
): Attendant {
  const attendant = Attendant.create(
    {
      login: fakerPT_BR.person.firstName(),
      name: fakerPT_BR.person.fullName(),
      password: fakerPT_BR.internet.password(),
      ...override,
    },
    id,
  )

  return attendant
}

@Injectable()
export class MakeAttendant {
  constructor(private readonly prisma: PrismaService) {}

  async create(override: Partial<AttendantProps> = {}, id?: UniqueEntityId) {
    const attendant = makeAttendant(override, id)

    await this.prisma.collaborator.create({
      data: AttendantPrismaMapper.toPrisma(attendant),
    })

    return attendant
  }
}
