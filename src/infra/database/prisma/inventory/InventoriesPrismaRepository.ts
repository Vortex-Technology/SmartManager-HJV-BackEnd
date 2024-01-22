import { Inventory } from '@modules/inventory/entities/Inventory'
import { InventoriesRepository } from '@modules/inventory/repositories/InventoriesRepository'
import { Injectable } from '@nestjs/common'
import { PrismaService } from '../index.service'
import { ProductVariantInventoriesRepository } from '@modules/inventory/repositories/ProductVariantInventoriesRepository'
import { InventoriesPrismaMapper } from './InventoriesPrismaMapper'

@Injectable()
export class InventoriesPrismaRepository implements InventoriesRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly productVariantInventoryRepository: ProductVariantInventoriesRepository,
  ) {}

  async create(inventory: Inventory): Promise<void> {
    await this.prisma.inventory.create({
      data: InventoriesPrismaMapper.toPrisma(inventory),
    })

    const productVariantInventory =
      inventory.productVariantInventories?.getNewItems()

    if (productVariantInventory) {
      await this.productVariantInventoryRepository.createMany(
        productVariantInventory,
      )
    }
  }

  async save(inventory: Inventory): Promise<void> {
    await this.prisma.inventory.update({
      where: {
        id: inventory.id.toString(),
      },
      data: InventoriesPrismaMapper.toPrisma(inventory),
    })

    const productVariantInventory =
      inventory.productVariantInventories?.getNewItems()

    if (productVariantInventory) {
      await this.productVariantInventoryRepository.createMany(
        productVariantInventory,
      )
    }
  }

  async findById(id: string): Promise<Inventory | null> {
    const inventory = await this.prisma.inventory.findUnique({
      where: {
        id,
        deletedAt: null,
      },
    })

    if (!inventory) return null

    return InventoriesPrismaMapper.toEntity(inventory)
  }
}
