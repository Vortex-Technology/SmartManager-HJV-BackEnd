import { Market } from '@modules/market/entities/Market'
import { MarketsRepository } from '@modules/market/repositories/MarketsRepository'
import { PrismaConfig, PrismaService } from '../index.service'
import { MarketsPrismaMapper } from './MarketsPrismaMapper'
import { CollaboratorsRepository } from '@modules/collaborator/repositories/CollaboratorsRepository'
import { Injectable } from '@nestjs/common'

@Injectable()
export class MarketsPrismaRepository
  implements MarketsRepository<PrismaConfig>
{
  constructor(
    private readonly prisma: PrismaService,
    private readonly collaboratorsRepository: CollaboratorsRepository,
  ) {}

  async createMany(markets: Market[]): Promise<void> {
    await this.prisma.$transaction(async (prisma) => {
      return Promise.all(
        markets.map(async (market) => {
          await prisma.market.create({
            data: MarketsPrismaMapper.toCreatePrisma(market),
          })
        }),
      )
    })
  }

  async findById(id: string): Promise<Market | null> {
    const market = await this.prisma.market.findUnique({
      where: {
        id,
      },
      include: {
        address: true,
      },
    })

    if (!market) return null

    return MarketsPrismaMapper.toEntity(market)
  }

  async save(market: Market, config?: PrismaConfig): Promise<void> {
    const prisma = config ? config.prisma : this.prisma

    await prisma.market.update({
      where: {
        id: market.id.toString(),
      },
      data: MarketsPrismaMapper.toUpdatePrisma(market),
    })

    const collaborators = market.collaborators?.getNewItems()

    if (collaborators) {
      await this.collaboratorsRepository.createMany(collaborators, config)
    }
  }
}
