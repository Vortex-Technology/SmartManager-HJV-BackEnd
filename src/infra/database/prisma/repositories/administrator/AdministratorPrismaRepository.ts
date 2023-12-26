import { AdministratorRepository } from '@modules/administrator/repositories/AdministratorRepository'
import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../index.service'
import { Administrator } from '@modules/administrator/entities/Administrator'
import { AdministratorPrismaMapper } from './AdministratorPrismaMapper'

@Injectable()
export class AdministratorPrismaRepository implements AdministratorRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Administrator | null> {
    const administrator = await this.prisma.collaborator.findUnique({
      where: {
        id,
      },
    })

    if (!administrator) return null

    return AdministratorPrismaMapper.toEntity(administrator)
  }

  async findByLogin(login: string): Promise<Administrator | null> {
    const administrator = await this.prisma.collaborator.findUnique({
      where: {
        login,
      },
    })

    if (!administrator) return null

    return AdministratorPrismaMapper.toEntity(administrator)
  }

  async create(administrator: Administrator): Promise<void> {
    await this.prisma.collaborator.create({
      data: AdministratorPrismaMapper.toPrisma(administrator),
    })
  }
}
