import { Inventory } from '@modules/inventory/entities/Inventory'
import { InventoriesRepository } from '@modules/inventory/repositories/InventoriesRepository'
import { Injectable } from '@nestjs/common'
import { PrismaConfig, PrismaService } from '../index.service'
import { ProductVariantInventoriesRepository } from '@modules/inventory/repositories/ProductVariantInventoriesRepository'
import { InventoriesPrismaMapper } from './InventoriesPrismaMapper'

@Injectable()
export class InventoriesPrismaRepository
  implements InventoriesRepository<PrismaConfig>
{
  constructor(
    private readonly prisma: PrismaService,
    private readonly productVariantInventoryRepository: ProductVariantInventoriesRepository,
  ) {}

  async create(inventory: Inventory, config?: PrismaConfig): Promise<void> {
    const prisma = config ? config.prisma : this.prisma

    await prisma.inventory.create({
      data: InventoriesPrismaMapper.toPrisma(inventory),
    })

    const productVariantInventory =
      inventory.productVariantInventories?.getNewItems()

    if (productVariantInventory) {
      await this.productVariantInventoryRepository.createMany(
        productVariantInventory,
        config,
      )
    }
  }

  async save(inventory: Inventory, config?: PrismaConfig): Promise<void> {
    const prisma = config ? config.prisma : this.prisma

    await prisma.inventory.update({
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
        config,
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
