import { Inventory } from '@modules/inventory/entities/Inventory'
import { InventoriesRepository } from '@modules/inventory/repositories/InventoriesRepository'
import { ProductVariantInventoriesRepository } from '@modules/inventory/repositories/ProductVariantInventoriesRepository'

export class InventoryInMemoryRepository implements InventoriesRepository {
  constructor(
    private readonly productVariantInventoryInMemoryRepository: ProductVariantInventoriesRepository,
  ) {}

  inventories: Inventory[] = []

  async create(inventory: Inventory): Promise<void> {
    this.inventories.push(inventory)

    const productVariantInventories =
      inventory.productVariantInventories?.getNewItems()

    if (productVariantInventories) {
      await this.productVariantInventoryInMemoryRepository.createMany(
        productVariantInventories,
      )
    }
  }

  async findById(id: string): Promise<Inventory | null> {
    const inventory = this.inventories.find(
      (inventory) => inventory.id.toString() === id,
    )

    if (!inventory) return null

    return inventory
  }

  async save(inventory: Inventory): Promise<void> {
    const existentInventoryIndex = this.inventories.findIndex((inventory) =>
      inventory.equals(inventory),
    )

    if (existentInventoryIndex === -1) {
      throw new Error('Make sure you already create inventory')
    }

    const productVariantInventories =
      inventory.productVariantInventories?.getNewItems()

    if (productVariantInventories) {
      await this.productVariantInventoryInMemoryRepository.createMany(
        productVariantInventories,
      )
    }

    this.inventories[existentInventoryIndex] = inventory
  }
}
