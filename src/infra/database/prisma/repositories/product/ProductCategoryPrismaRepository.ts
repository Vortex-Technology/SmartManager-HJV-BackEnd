import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../index.service'
import { ProductCategoryPrismaMapper } from './ProductCategoryPrismaMapper'
import { ProductCategoriesRepository } from '@modules/product/repositories/ProductCategoriesRepository'
import { ProductCategory } from '@modules/product/entities/ProductCategory'

@Injectable()
export class ProductCategoryPrismaRepository
  implements ProductCategoriesRepository
{
  constructor(private readonly prisma: PrismaService) {}

  async create(productCategory: ProductCategory): Promise<void> {
    await this.prisma.productCategory.create({
      data: ProductCategoryPrismaMapper.toPrisma(productCategory),
    })
  }

  async findByName(name: string): Promise<ProductCategory | null> {
    const productCategory = await this.prisma.productCategory.findUnique({
      where: {
        name,
      },
    })

    if (!productCategory) return null

    return ProductCategoryPrismaMapper.toEntity(productCategory)
  }

  async createMany(productCategories: ProductCategory[]): Promise<void> {
    await this.prisma.productCategory.createMany({
      data: productCategories.map(ProductCategoryPrismaMapper.toPrisma),
    })
  }

  async findByNames(names: string[]): Promise<(ProductCategory | null)[]> {
    const productCategories = await this.prisma.productCategory.findMany({
      where: {
        name: {
          in: names,
        },
      },
    })

    const productsCategoriesWithNullValues = names.map((name) => {
      const productCategory = productCategories.find((pc) => pc.name === name)
      if (!productCategory) return null
      return productCategory
    })

    return productsCategoriesWithNullValues.map((category) =>
      category ? ProductCategoryPrismaMapper.toEntity(category) : null,
    )
  }
}
