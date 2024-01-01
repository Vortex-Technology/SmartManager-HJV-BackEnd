import { ProductCategory } from '@modules/productCategory/entities/ProductCategory'
import { ProductCategoriesRepository } from '@modules/productCategory/repositories/ProductCategoriesRepository'
import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../index.service'
import { ProductCategoryPrismaMapper } from './ProductCategoryPrismaMapper'

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
}
