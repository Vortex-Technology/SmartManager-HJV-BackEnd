import { fakerPT_BR } from '@faker-js/faker'
import { PrismaService } from '@infra/database/prisma/index.service'
import { ProductVariantsPrismaMapper } from '@infra/database/prisma/product/ProductVariantsPrismaMapper'
import { ProductUnitType } from '@modules/product/entities/Product'
import {
  ProductVariant,
  ProductVariantProps,
} from '@modules/product/entities/ProductVariant'
import { Injectable } from '@nestjs/common'
import { UniqueEntityId } from '@shared/core/valueObjects/UniqueEntityId'

export function makeProductVariant(
  override: Partial<ProductVariantProps>,
  id?: UniqueEntityId,
) {
  return ProductVariant.create(
    {
      name: fakerPT_BR.commerce.productName(),
      barCode: fakerPT_BR.number.int().toString(),
      brand: fakerPT_BR.commerce.product(),
      description: fakerPT_BR.commerce.productDescription(),
      pricePerUnit: fakerPT_BR.number.int(),
      productId: new UniqueEntityId(),
      unitType: ProductUnitType.KILOS,
      ...override,
    },
    id,
  )
}

@Injectable()
export class MakeProductVariant {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    override: Partial<ProductVariantProps> = {},
    id?: UniqueEntityId,
  ) {
    const productVariant = makeProductVariant(override, id)

    await this.prisma.productVariant.create({
      data: ProductVariantsPrismaMapper.toPrisma(productVariant),
    })

    return productVariant
  }
}
