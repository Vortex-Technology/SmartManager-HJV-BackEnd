import { Market } from '@modules/market/entities/Market'
import {
  Prisma,
  Market as MarketPrisma,
  Address as AddressPrisma,
} from '@prisma/client'
import { InventoriesPrismaMapper } from '../inventory/InventoriesPrismaMapper'
import { UniqueEntityId } from '@shared/core/valueObjects/UniqueEntityId'
import { AddressesPrismaMapper } from '../address/AddressesPrismaMapper'

type MarketWithAddressPrisma = MarketPrisma & {
  address: AddressPrisma
}

export class MarketsPrismaMapper {
  static toEntity(raw: MarketWithAddressPrisma): Market {
    return Market.create(
      {
        address: AddressesPrismaMapper.toEntity(raw.address),
        companyId: new UniqueEntityId(raw.companyId),
        inventoryId: new UniqueEntityId(raw.inventoryId),
        tradeName: raw.tradeName,
        createdAt: raw.createdAt,
        deletedAt: raw.deletedAt,
        updatedAt: raw.updatedAt,
      },
      new UniqueEntityId(raw.id),
    )
  }

  static toCreateWithoutAddressPrisma(
    market: Market,
  ): Prisma.MarketCreateWithoutAddressInput {
    if (!market.inventory) {
      throw new Error('Market must have an inventory')
    }

    return {
      company: {
        connect: {
          id: market.companyId.toString(),
        },
      },
      inventory: {
        create: InventoriesPrismaMapper.toPrisma(market.inventory),
      },
      tradeName: market.tradeName,
      id: market.id.toString(),
      createdAt: market.createdAt,
      deletedAt: market.deletedAt,
      updatedAt: market.updatedAt,
    }
  }

  static toUpdatePrisma(market: Market): Prisma.MarketUpdateInput {
    return {
      address: {
        update: AddressesPrismaMapper.toPrisma(market.address),
      },
      tradeName: market.tradeName,
      createdAt: market.createdAt,
      deletedAt: market.deletedAt,
      updatedAt: market.updatedAt,
    }
  }
}
