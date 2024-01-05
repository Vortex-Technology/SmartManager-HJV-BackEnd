import { Attendant } from '@modules/attendant/entities/Attendant'
import { AttendantRepository } from '@modules/attendant/repositories/AttendantRepository'
import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../index.service'
import { AttendantPrismaMapper } from './AttendantPrismaMapper'

@Injectable()
export class AttendantPrismaRepository implements AttendantRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(attendant: Attendant): Promise<void> {
    await this.prisma.collaborator.create({
      data: AttendantPrismaMapper.toPrisma(attendant),
    })
  }

  async findByLogin(login: string): Promise<Attendant | null> {
    const attendant = await this.prisma.collaborator.findUnique({
      where: {
        login,
        deletedAt: null,
      },
    })

    if (!attendant) return null

    return AttendantPrismaMapper.toEntity(attendant)
  }

  async findById(id: string): Promise<Attendant | null> {
    const attendant = await this.prisma.collaborator.findUnique({
      where: {
        id,
        deletedAt: null,
      },
    })

    if (!attendant) return null

    return AttendantPrismaMapper.toEntity(attendant)
  }
}
