import {
  CollaboratorsRepository,
  FindManyByMarketIdProps,
} from '@modules/collaborator/repositories/CollaboratorsRepository'
import { Injectable } from '@nestjs/common'
import { PrismaConfig, PrismaService } from '../index.service'
import {
  Collaborator,
  CollaboratorRole,
} from '@modules/collaborator/entities/Collaborator'
import { CollaboratorsPrismaMapper } from './CollaboratorsPrismaMapper'

@Injectable()
export class CollaboratorsPrismaRepository
  implements CollaboratorsRepository<PrismaConfig>
{
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(
    email: string,
  ): Promise<Collaborator<CollaboratorRole> | null> {
    const collaborator = await this.prisma.collaborator.findUnique({
      where: {
        email,
      },
    })

    if (!collaborator) return null

    return CollaboratorsPrismaMapper.toEntity(collaborator)
  }

  async findById(id: string): Promise<Collaborator<CollaboratorRole> | null> {
    const collaborator = await this.prisma.collaborator.findUnique({
      where: {
        id,
      },
    })

    if (!collaborator) return null

    return CollaboratorsPrismaMapper.toEntity(collaborator)
  }

  async createMany(
    collaborator: Collaborator<CollaboratorRole>[],
    config?: PrismaConfig,
  ): Promise<void> {
    const prisma = config ? config.prisma : this.prisma

    await prisma.collaborator.createMany({
      data: collaborator.map(CollaboratorsPrismaMapper.toPrisma),
    })
  }

  async create(collaborator: Collaborator<CollaboratorRole>): Promise<void> {
    await this.prisma.collaborator.create({
      data: CollaboratorsPrismaMapper.toPrisma(collaborator),
    })
  }

  async findManyByMarketId({
    limit,
    marketId,
    page,
  }: FindManyByMarketIdProps): Promise<Collaborator<CollaboratorRole>[]> {
    const collaborators = await this.prisma.collaborator.findMany({
      where: {
        marketId,
        deletedAt: null,
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip: (page - 1) * limit,
      take: limit,
    })

    return collaborators.map(CollaboratorsPrismaMapper.toEntity)
  }

  async countByMarketId(marketId: string): Promise<number> {
    return await this.prisma.collaborator.count({
      where: {
        marketId,
        deletedAt: null,
      },
    })
  }
}
