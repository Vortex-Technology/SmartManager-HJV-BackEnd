import { WatchedList } from '@shared/core/entities/WatchedList'
import { ProductCategory } from './ProductCategory'

export class ProductCategoriesList extends WatchedList<ProductCategory> {
  compareItems(a: ProductCategory, b: ProductCategory): boolean {
    const equals = a.equals(b) || a.name === b.name
    return equals
  }
}
