import { ProductVariantInventoriesRepository } from '@modules/inventory/repositories/ProductVariantInventoriesRepository'
import { PrismaService } from '../../index.service'
import { ProductVariantInventory } from '@modules/inventory/entities/ProductVariantInventory'
import { ProductVariantInventoryPrismaMapper } from './ProductVariantInventoryPrismaMapper'
import { Injectable } from '@nestjs/common'

@Injectable()
export class ProductVariantInventoryPrismaRepository
  implements ProductVariantInventoriesRepository
{
  constructor(private readonly prisma: PrismaService) {}

  async createMany(
    productVariantInventories: ProductVariantInventory[],
  ): Promise<void> {
    await this.prisma.productVariantInventory.createMany({
      data: productVariantInventories.map(
        ProductVariantInventoryPrismaMapper.toPrisma,
      ),
      skipDuplicates: true,
    })
  }
}
