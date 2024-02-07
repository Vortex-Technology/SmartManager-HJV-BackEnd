import { ProductVariantInventory } from '@modules/inventory/entities/ProductVariantInventory'
import { ProductVariantInventoriesRepository } from '@modules/inventory/repositories/ProductVariantInventoriesRepository'

export class ProductVariantInventoriesInMemoryRepository
  implements ProductVariantInventoriesRepository
{
  productVariantInventories: ProductVariantInventory[] = []

  async createMany(
    productVariantInventories: ProductVariantInventory[],
  ): Promise<void> {
    this.productVariantInventories.push(...productVariantInventories)
  }

  async findByInventoryIdAndProductVariantId(
    inventoryId: string,
    productVariantId: string,
  ): Promise<ProductVariantInventory | null> {
    const productVariant = this.productVariantInventories.find(
      (productVariantInventory) =>
        productVariantInventory.productVariantId.toString() ===
          productVariantId &&
        productVariantInventory.inventoryId.toString() === inventoryId,
    )

    if (!productVariant) return null

    return productVariant
  }

  async save(productVariantInventory: ProductVariantInventory): Promise<void> {
    const existentProductVariantInventoryIndex =
      this.productVariantInventories.findIndex((PVI) =>
        PVI.equals(productVariantInventory),
      )

    if (existentProductVariantInventoryIndex === -1) {
      throw new Error('Make sure you already created a product variant')
    }

    this.productVariantInventories[existentProductVariantInventoryIndex] =
      productVariantInventory
  }
}
