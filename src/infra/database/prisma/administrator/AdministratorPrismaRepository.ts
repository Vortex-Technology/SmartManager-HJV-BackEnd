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
        deletedAt: null,
      },
    })

    if (!administrator) return null

    return AdministratorPrismaMapper.toEntity(administrator)
  }

  async findByLogin(login: string): Promise<Administrator | null> {
    const administrator = await this.prisma.collaborator.findUnique({
      where: {
        login,
        deletedAt: null,
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

  async save(administrator: Administrator): Promise<void> {
    await this.prisma.collaborator.update({
      where: {
        id: administrator.id.toString(),
      },
      data: AdministratorPrismaMapper.toPrisma(administrator),
    })
  }

  async findMany({
    page,
    limit,
  }: {
    page: number
    limit: number
  }): Promise<Administrator[]> {
    const administrators = await this.prisma.collaborator.findMany({
      where: {
        deletedAt: null,
        type: 'ADMINISTRATOR',
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip: (page - 1) * limit,
      take: limit,
    })

    return administrators.map(AdministratorPrismaMapper.toEntity)
  }

  async count(): Promise<number> {
    return await this.prisma.collaborator.count({
      where: {
        deletedAt: null,
        type: 'ADMINISTRATOR',
      },
    })
  }
}