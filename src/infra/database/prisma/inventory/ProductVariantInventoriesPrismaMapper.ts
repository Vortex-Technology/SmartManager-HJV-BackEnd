import { ProductVariantInventory } from '@modules/inventory/entities/ProductVariantInventory'
import {
  Prisma,
  ProductVariantInventory as ProductVariantInventoryPrisma,
} from '@prisma/client'
import { UniqueEntityId } from '@shared/core/entities/valueObjects/UniqueEntityId'

export class ProductVariantInventoriesPrismaMapper {
  static toEntity(raw: ProductVariantInventoryPrisma): ProductVariantInventory {
    return ProductVariantInventory.create(
      {
        inventoryId: new UniqueEntityId(raw.inventoryId),
        productVariantId: new UniqueEntityId(raw.productVariantId),
        quantity: raw.quantity,
        createdAt: raw.createdAt,
        deletedAt: raw.deletedAt,
        updatedAt: raw.updatedAt,
      },
      new UniqueEntityId(raw.id),
    )
  }

  static toPrisma(
    inventory: ProductVariantInventory,
  ): Prisma.ProductVariantInventoryUncheckedCreateInput {
    return {
      id: inventory.id.toString(),
      inventoryId: inventory.inventoryId.toString(),
      productVariantId: inventory.productVariantId.toString(),
      quantity: inventory.quantity,
      createdAt: inventory.createdAt,
      deletedAt: inventory.deletedAt,
      updatedAt: inventory.updatedAt,
    }
  }
}
