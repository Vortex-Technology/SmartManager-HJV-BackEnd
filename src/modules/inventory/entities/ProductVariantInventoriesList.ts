import { WatchedList } from '@shared/core/entities/WatchedList'
import { ProductVariantInventory } from './ProductVariantInventory'

export class ProductVariantInventoriesList extends WatchedList<ProductVariantInventory> {
  compareItems(
    a: ProductVariantInventory,
    b: ProductVariantInventory,
  ): boolean {
    return a.equals(b)
  }
}
