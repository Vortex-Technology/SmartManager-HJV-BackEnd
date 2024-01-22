import { Inventory } from '@modules/inventory/entities/Inventory'
import { InventoriesRepository } from '@modules/inventory/repositories/InventoriesRepository'
import { ProductVariantInventoriesInMemoryRepository } from './ProductVariantInventoriesInMemoryRepository'

export class InventoriesInMemoryRepository implements InventoriesRepository {
  constructor(
    private readonly productVariantInventoriesInMemoryRepository: ProductVariantInventoriesInMemoryRepository,
  ) {}

  inventories: Inventory[] = []

  async create(inventory: Inventory): Promise<void> {
    this.inventories.push(inventory)

    const productVariantInventories =
      inventory.productVariantInventories?.getNewItems()

    if (productVariantInventories) {
      await this.productVariantInventoriesInMemoryRepository.createMany(
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
      await this.productVariantInventoriesInMemoryRepository.createMany(
        productVariantInventories,
      )
    }

    this.inventories[existentInventoryIndex] = inventory
  }
}
