import { ProductVariantInventory } from '../entities/ProductVariantInventory'

export abstract class ProductVariantInventoriesRepository<ConfigT = unknown> {
  abstract createMany(
    productVariantInventories: ProductVariantInventory[],
    config?: ConfigT,
  ): Promise<void>
}
