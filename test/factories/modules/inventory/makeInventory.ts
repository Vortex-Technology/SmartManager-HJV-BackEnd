import { fakerPT_BR } from '@faker-js/faker'
import { PrismaService } from '@infra/database/prisma/index.service'
import { InventoryPrismaMapper } from '@infra/database/prisma/inventory/InventoryPrismaMapper'
import {
  Inventory,
  InventoryProps,
} from '@modules/inventory/entities/Inventory'
import { Injectable } from '@nestjs/common'
import { UniqueEntityId } from '@shared/core/entities/valueObjects/UniqueEntityId'

export function makeInventory(
  override: Partial<InventoryProps> = {},
  id?: UniqueEntityId,
): Inventory {
  const inventory = Inventory.create(
    {
      name: fakerPT_BR.person.fullName(),
      ...override,
    },
    id,
  )

  return inventory
}

@Injectable()
export class MakeInventory {
  constructor(private readonly prisma: PrismaService) {}

  async create(override: Partial<InventoryProps> = {}, id?: UniqueEntityId) {
    const inventory = makeInventory(override, id)

    await this.prisma.inventory.create({
      data: InventoryPrismaMapper.toPrisma(inventory),
    })

    return inventory
  }
}
