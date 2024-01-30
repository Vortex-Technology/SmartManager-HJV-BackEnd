import { ProductVariantInventory } from '../entities/ProductVariantInventory'

export abstract class ProductVariantInventoriesRepository<ConfigT = unknown> {
  abstract createMany(
    productVariantInventories: ProductVariantInventory[],
    config?: ConfigT,
  ): Promise<void>

  abstract findByInventoryIdAndProductVariantId(
    inventoryId: string,
    productVariantId: string,
  ): Promise<ProductVariantInventory | null>

  abstract save(
    productVariantInventory: ProductVariantInventory,
    config?: ConfigT,
  ): Promise<void>
}
