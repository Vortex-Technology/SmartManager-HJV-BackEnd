import { Market } from '@modules/market/entities/Market'
import { WatchedList } from '@shared/core/entities/WatchedList'

export class CompanyMarketsList extends WatchedList<Market> {
  compareItems(a: Market, b: Market): boolean {
    return a.equals(b)
  }
}
