import { Inventory } from '../entities/Inventory'

export abstract class InventoriesRepository<ConfigT = unknown> {
  abstract create(inventory: Inventory, config?: ConfigT): Promise<void>
  abstract save(inventory: Inventory, config?: ConfigT): Promise<void>
  abstract findById(id: string): Promise<Inventory | null>
}
