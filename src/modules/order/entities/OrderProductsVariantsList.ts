import { WatchedList } from '@shared/core/entities/WatchedList'
import { OrderProductsVariants } from './OrderProductsVariants'

export class OrderProductsVariantsList extends WatchedList<OrderProductsVariants> {
  compareItems(a: OrderProductsVariants, b: OrderProductsVariants): boolean {
    return a.equals(b)
  }
}
