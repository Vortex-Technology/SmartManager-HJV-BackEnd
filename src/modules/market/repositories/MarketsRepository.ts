import { Market } from '../entities/Market'

export abstract class MarketsRepository<ConfigT = unknown> {
  abstract createMany(markets: Market[]): Promise<void>
  abstract findById(id: string): Promise<Market | null>
  abstract save(market: Market, config?: ConfigT): Promise<void>
}
