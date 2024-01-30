import { ProductVariantInventoriesRepository } from '@modules/inventory/repositories/ProductVariantInventoriesRepository'
import { PrismaConfig, PrismaService } from '../index.service'
import { ProductVariantInventory } from '@modules/inventory/entities/ProductVariantInventory'
import { Injectable } from '@nestjs/common'
import { ProductVariantInventoriesPrismaMapper } from './ProductVariantInventoriesPrismaMapper'

@Injectable()
export class ProductVariantInventoriesPrismaRepository
  implements ProductVariantInventoriesRepository<PrismaConfig>
{
  constructor(private readonly prisma: PrismaService) {}

  async createMany(
    productVariantInventories: ProductVariantInventory[],
    config?: PrismaConfig,
  ): Promise<void> {
    const prisma = config ? config.prisma : this.prisma

    await prisma.productVariantInventory.createMany({
      data: productVariantInventories.map(
        ProductVariantInventoriesPrismaMapper.toPrisma,
      ),
      skipDuplicates: true,
    })
  }

  async findByInventoryIdAndProductVariantId(
    inventoryId: string,
    productVariantId: string,
  ): Promise<ProductVariantInventory | null> {
    const productVariantInventory =
      await this.prisma.productVariantInventory.findFirst({
        where: {
          inventoryId,
          productVariantId,
        },
      })

    if (!productVariantInventory) return null

    return ProductVariantInventoriesPrismaMapper.toEntity(
      productVariantInventory,
    )
  }

  async save(
    productVariantInventory: ProductVariantInventory,
    config?: PrismaConfig | undefined,
  ): Promise<void> {
    const prisma = config ? config.prisma : this.prisma

    await prisma.productVariantInventory.update({
      where: {
        id: productVariantInventory.id.toString(),
      },
      data: ProductVariantInventoriesPrismaMapper.toPrisma(
        productVariantInventory,
      ),
    })
  }
}
