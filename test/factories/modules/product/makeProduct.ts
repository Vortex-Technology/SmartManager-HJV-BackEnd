import { fakerPT_BR } from '@faker-js/faker'
import { PrismaService } from '@infra/database/prisma/index.service'
import { ProductVariantPrismaMapper } from '@infra/database/prisma/product/ProductVariantPrismaMapper'
import { ProductsPrismaMapper } from '@infra/database/prisma/product/ProductsPrismaMapper'
import { Product, ProductProps } from '@modules/product/entities/Product'
import { Injectable } from '@nestjs/common'
import { UniqueEntityId } from '@shared/core/entities/valueObjects/UniqueEntityId'

export function makeProduct(
  override: Partial<ProductProps>,
  id?: UniqueEntityId,
) {
  return Product.create(
    {
      name: fakerPT_BR.commerce.productName(),
      ...override,
    },
    id,
  )
}

@Injectable()
export class MakeProduct {
  constructor(private readonly prisma: PrismaService) {}

  async create(override: Partial<ProductProps> = {}, id?: UniqueEntityId) {
    const product = makeProduct(override, id)

    const productVariants = product.productVariants?.getNewItems() ?? []

    await this.prisma.product.create({
      data: ProductsPrismaMapper.toPrisma(product),
    })

    if (productVariants.length >= 1) {
      await this.prisma.productVariant.createMany({
        data: productVariants.map(ProductVariantPrismaMapper.toPrisma),
      })
    }

    return product
  }
}
