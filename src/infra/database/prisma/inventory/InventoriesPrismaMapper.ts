import { Inventory } from '@modules/inventory/entities/Inventory'
import { Prisma, Inventory as InventoryPrisma } from '@prisma/client'
import { UniqueEntityId } from '@shared/core/valueObjects/UniqueEntityId'

export class InventoriesPrismaMapper {
  static toEntity(raw: InventoryPrisma): Inventory {
    return Inventory.create(
      {
        name: raw.name,
        createdAt: raw.createdAt,
        deletedAt: raw.deletedAt,
        updatedAt: raw.updatedAt,
        companyId: new UniqueEntityId(raw.companyId),
      },
      new UniqueEntityId(raw.id),
    )
  }

  static toPrisma(inventory: Inventory): Prisma.InventoryUncheckedCreateInput {
    return {
      id: inventory.id.toString(),
      name: inventory.name,
      createdAt: inventory.createdAt,
      deletedAt: inventory.deletedAt,
      updatedAt: inventory.updatedAt,
      companyId: inventory.companyId.toString(),
    }
  }
}
