import { Market } from '@modules/market/entities/Market'
import { MarketsRepository } from '@modules/market/repositories/MarketsRepository'
import { PrismaService } from '../index.service'
import { MarketsPrismaMapper } from './MarketsPrismaMapper'
import { AddressesPrismaMapper } from '../address/AddressesPrismaMapper'
import { CollaboratorsRepository } from '@modules/collaborator/repositories/CollaboratorsRepository'

export class MarketsPrismaRepository implements MarketsRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly collaboratorsRepository: CollaboratorsRepository,
  ) {}

  async createMany(markets: Market[]): Promise<void> {
    await this.prisma.$transaction(async (prisma) => {
      const data = markets.map((market) => ({
        market,
        address: market.address,
      }))

      return Promise.all(
        data.map(async (d) => {
          const address = await prisma.address.create({
            data: AddressesPrismaMapper.toPrisma(d.address),
          })

          await prisma.market.create({
            data: {
              ...MarketsPrismaMapper.toCreateWithoutAddressPrisma(d.market),
              address: {
                connect: {
                  id: address.id,
                },
              },
            },
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

  async save(market: Market): Promise<void> {
    await this.prisma.market.update({
      where: {
        id: market.id.toString(),
      },
      data: MarketsPrismaMapper.toUpdatePrisma(market),
    })

    const collaborators = market.collaborators?.getNewItems()

    if (collaborators) {
      await this.collaboratorsRepository.createMany(collaborators)
    }
  }
}
