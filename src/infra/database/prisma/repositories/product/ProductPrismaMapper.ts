import { Product } from '@modules/product/entities/Product'
import { Prisma, Product as ProductPrisma } from '@prisma/client'
import { UniqueEntityId } from '@shared/core/entities/valueObjects/UniqueEntityId'

export class ProductPrismaMapper {
  static toEntity(raw: ProductPrisma): Product {
    return Product.create(
      {
        name: raw.name,
        createdAt: raw.createdAt,
        deletedAt: raw.deletedAt,
        updatedAt: raw.updatedAt,
      },
      new UniqueEntityId(raw.id),
    )
  }

  static toPrisma(product: Product): Prisma.ProductUncheckedCreateInput {
    return {
      id: product.id.toString(),
      name: product.name,
      createdAt: product.createdAt,
      deletedAt: product.deletedAt,
      updatedAt: product.updatedAt,
      productCategories: {
        connect: product.productCategories?.getItems().map((category) => ({
          id: category.id.toString(),
        })),
      },
    }
  }
}
