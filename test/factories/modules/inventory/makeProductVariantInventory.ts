import { PrismaService } from '@infra/database/prisma/index.service'
import { ProductVariantInventoriesPrismaMapper } from '@infra/database/prisma/inventory/ProductVariantInventoriesPrismaMapper'
import {
  ProductVariantInventory,
  ProductVariantInventoryProps,
} from '@modules/inventory/entities/ProductVariantInventory'
import { Injectable } from '@nestjs/common'
import { UniqueEntityId } from '@shared/core/valueObjects/UniqueEntityId'

export function makeProductVariantInventory(
  override: Partial<ProductVariantInventoryProps> = {},
  id?: UniqueEntityId,
): ProductVariantInventory {
  const productVariantInventory = ProductVariantInventory.create(
    {
      inventoryId: new UniqueEntityId(),
      productVariantId: new UniqueEntityId(),
      quantity: 100,
      ...override,
    },
    id,
  )

  return productVariantInventory
}

@Injectable()
export class MakeProductVariantInventory {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    override: Partial<ProductVariantInventoryProps> = {},
    id?: UniqueEntityId,
  ) {
    const productVariantInventory = makeProductVariantInventory(override, id)

    await this.prisma.productVariantInventory.create({
      data: ProductVariantInventoriesPrismaMapper.toPrisma(
        productVariantInventory,
      ),
    })

    return productVariantInventory
  }
}
