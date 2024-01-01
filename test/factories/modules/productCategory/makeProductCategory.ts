import { fakerPT_BR } from '@faker-js/faker'
import { PrismaService } from '@infra/database/prisma/index.service'
import { ProductCategoryPrismaMapper } from '@infra/database/prisma/repositories/productCategory/ProductCategoryPrismaMapper'
import {
  ProductCategory,
  ProductCategoryProps,
} from '@modules/productCategory/entities/ProductCategory'
import { Injectable } from '@nestjs/common'
import { UniqueEntityId } from '@shared/core/entities/valueObjects/UniqueEntityId'

export function makeProductCategory(
  override: Partial<ProductCategoryProps>,
  id?: UniqueEntityId,
) {
  return ProductCategory.create(
    {
      name: fakerPT_BR.commerce.productName(),
      description: fakerPT_BR.lorem.paragraph(),
      ...override,
    },
    id,
  )
}

@Injectable()
export class MakeProductCategory {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    override: Partial<ProductCategoryProps> = {},
    id?: UniqueEntityId,
  ) {
    const productCategory = makeProductCategory(override, id)

    await this.prisma.productCategory.create({
      data: ProductCategoryPrismaMapper.toPrisma(productCategory),
    })

    return productCategory
  }
}
