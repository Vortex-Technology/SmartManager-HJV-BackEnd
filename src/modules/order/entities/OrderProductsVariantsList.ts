import { WatchedList } from '@shared/core/entities/WatchedList'
import { OrderProductVariant } from './OrderProductVariant'

export class OrderProductsVariantsList extends WatchedList<OrderProductVariant> {
  compareItems(a: OrderProductVariant, b: OrderProductVariant): boolean {
    return a.equals(b)
  }
}
