import { Market } from '../entities/Market'

export abstract class MarketsRepository {
  abstract createMarket(markets: Market[]): Promise<void>
  abstract findById(id: string): Promise<Market | null>
  abstract save(market: Market): Promise<void>
}
