import { Injectable } from '@nestjs/common'
import { ProductCategoriesRepository } from '@modules/product/repositories/ProductCategoriesRepository'
import { ProductCategory } from '@modules/product/entities/ProductCategory'
import { PrismaConfig, PrismaService } from '../index.service'
import { ProductCategoriesPrismaMapper } from './ProductCategoriesPrismaMapper'

@Injectable()
export class ProductCategoriesPrismaRepository
  implements ProductCategoriesRepository<PrismaConfig>
{
  constructor(private readonly prisma: PrismaService) {}

  async create(productCategory: ProductCategory): Promise<void> {
    await this.prisma.productCategory.create({
      data: ProductCategoriesPrismaMapper.toPrisma(productCategory),
    })
  }

  async findByName(name: string): Promise<ProductCategory | null> {
    const productCategory = await this.prisma.productCategory.findUnique({
      where: {
        name,
      },
    })

    if (!productCategory) return null

    return ProductCategoriesPrismaMapper.toEntity(productCategory)
  }

  async createMany(
    productCategories: ProductCategory[],
    config?: PrismaConfig,
  ): Promise<void> {
    const prisma = config ? config.prisma : this.prisma

    await prisma.productCategory.createMany({
      data: productCategories.map(ProductCategoriesPrismaMapper.toPrisma),
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
      category ? ProductCategoriesPrismaMapper.toEntity(category) : null,
    )
  }
}
