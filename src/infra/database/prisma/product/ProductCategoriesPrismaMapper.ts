import { ProductCategory } from '@modules/product/entities/ProductCategory'
import {
  Prisma,
  ProductCategory as ProductCategoryPrisma,
} from '@prisma/client'
import { UniqueEntityId } from '@shared/core/valueObjects/UniqueEntityId'

export class ProductCategoriesPrismaMapper {
  static toEntity(raw: ProductCategoryPrisma): ProductCategory {
    return ProductCategory.create(
      {
        name: raw.name,
        createdAt: raw.createdAt,
        deletedAt: raw.deletedAt,
        description: raw.description,
      },
      new UniqueEntityId(raw.id),
    )
  }

  static toPrisma(
    productCategory: ProductCategory,
  ): Prisma.ProductCategoryUncheckedCreateInput {
    return {
      id: productCategory.id.toString(),
      name: productCategory.name,
      createdAt: productCategory.createdAt,
      deletedAt: productCategory.deletedAt,
      description: productCategory.description,
    }
  }
}
