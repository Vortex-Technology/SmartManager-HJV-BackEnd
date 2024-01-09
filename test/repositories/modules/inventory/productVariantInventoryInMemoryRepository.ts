import { ProductVariantInventory } from '@modules/inventory/entities/ProductVariantInventory'
import { ProductVariantInventoriesRepository } from '@modules/inventory/repositories/ProductVariantInventoriesRepository'

export class ProductVariantInventoryInMemoryRepository
  implements ProductVariantInventoriesRepository
{
  productVariantInventories: ProductVariantInventory[] = []

  async createMany(
    productVariantInventories: ProductVariantInventory[],
  ): Promise<void> {
    this.productVariantInventories.push(...productVariantInventories)
  }
}
