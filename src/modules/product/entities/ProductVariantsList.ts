import { WatchedList } from '@shared/core/entities/WatchedList'
import { ProductVariant } from './ProductVariant'

export class ProductVariantsList extends WatchedList<ProductVariant> {
  compareItems(a: ProductVariant, b: ProductVariant): boolean {
    return a.equals(b)
  }
}
