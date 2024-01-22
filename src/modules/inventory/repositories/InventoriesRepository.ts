import { Inventory } from '../entities/Inventory'

export abstract class InventoriesRepository {
  abstract create(inventory: Inventory): Promise<void>
  abstract save(inventory: Inventory): Promise<void>
  abstract findById(id: string): Promise<Inventory | null>
}
