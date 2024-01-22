import { ProductVariantInventoriesRepository } from '@modules/inventory/repositories/ProductVariantInventoriesRepository'
import { PrismaService } from '../index.service'
import { ProductVariantInventory } from '@modules/inventory/entities/ProductVariantInventory'
import { Injectable } from '@nestjs/common'
import { ProductVariantInventoriesPrismaMapper } from './ProductVariantInventoriesPrismaMapper'

@Injectable()
export class ProductVariantInventoriesPrismaRepository
  implements ProductVariantInventoriesRepository
{
  constructor(private readonly prisma: PrismaService) {}

  async createMany(
    productVariantInventories: ProductVariantInventory[],
  ): Promise<void> {
    await this.prisma.productVariantInventory.createMany({
      data: productVariantInventories.map(
        ProductVariantInventoriesPrismaMapper.toPrisma,
      ),
      skipDuplicates: true,
    })
  }
}
