import { Market } from '@modules/market/entities/Market'
import { MarketsRepository } from '@modules/market/repositories/MarketsRepository'
import { CollaboratorsInMemoryRepository } from '../collaborator/CollaboratorsInMemoryRepository'
import { Collaborator } from '@modules/collaborator/entities/Collaborator'
import { InventoriesInMemoryRepository } from '../inventory/InventoriesInMemoryRepository'

export class MarketsInMemoryRepository implements MarketsRepository {
  constructor(
    private readonly collaboratorsInMemoryRepository: CollaboratorsInMemoryRepository,
    private readonly inventoriesInMemoryRepository: InventoriesInMemoryRepository,
  ) {}

  markets: Market[] = []

  async createMany(markets: Market[]): Promise<void> {
    this.markets.push(...markets)

    const newCollaborators: Collaborator[] = []

    for (const market of markets) {
      const newCollaboratorsInCurrentMarket = market.collaborators?.getItems()

      if (newCollaboratorsInCurrentMarket) {
        newCollaborators.push(...newCollaboratorsInCurrentMarket)
      }

      if (market.inventory) {
        await this.inventoriesInMemoryRepository.create(market.inventory)
      }
    }

    if (newCollaborators.length > 0) {
      await this.collaboratorsInMemoryRepository.createMany(newCollaborators)
    }
  }

  async findById(id: string): Promise<Market | null> {
    const market = this.markets.find((market) => market.id.toString() === id)

    if (!market) return null

    return market
  }

  async save(market: Market): Promise<void> {
    const marketIndex = this.markets.findIndex((existingMarket) =>
      existingMarket.equals(market),
    )

    if (marketIndex === -1) {
      throw new Error('Make sure you already create market')
    }

    this.markets[marketIndex] = market

    const collaborators = market.collaborators?.getNewItems()

    if (collaborators) {
      await this.collaboratorsInMemoryRepository.createMany(collaborators)
    }

    if (market.inventory) {
      await this.inventoriesInMemoryRepository.create(market.inventory)
    }
  }
}
