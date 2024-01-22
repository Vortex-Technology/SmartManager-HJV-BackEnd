import { ProductVariantInventory } from '../entities/ProductVariantInventory'

export abstract class ProductVariantInventoriesRepository {
  abstract createMany(
    productVariantInventories: ProductVariantInventory[],
  ): Promise<void>
}
