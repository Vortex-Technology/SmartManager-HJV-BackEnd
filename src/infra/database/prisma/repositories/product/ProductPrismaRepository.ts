import { Product } from '@modules/product/entities/Product'
import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../index.service'
import { ProductVariantsRepository } from '@modules/product/repositories/ProductVariantsRepository'
import { ProductPrismaMapper } from './ProductPrismaMapper'
import { ProductsRepository } from '@modules/product/repositories/ProductsRepository'

@Injectable()
export class ProductPrismaRepository implements ProductsRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly productVariantRepository: ProductVariantsRepository,
  ) {}

  async create(product: Product): Promise<void> {
    const productVariants = product.productVariants?.getNewItems() ?? []

    await this.prisma.product.create({
      data: ProductPrismaMapper.toPrisma(product),
    })

    if (productVariants.length >= 1) {
      await this.productVariantRepository.createMany(productVariants)
    }
  }
}
