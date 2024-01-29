import { Product } from '@modules/product/entities/Product'
import { Injectable } from '@nestjs/common'
import { ProductVariantsRepository } from '@modules/product/repositories/ProductVariantsRepository'
import { ProductsRepository } from '@modules/product/repositories/ProductsRepository'
import { PrismaConfig, PrismaService } from '../index.service'
import { ProductsPrismaMapper } from './ProductsPrismaMapper'

@Injectable()
export class ProductsPrismaRepository
  implements ProductsRepository<PrismaConfig>
{
  constructor(
    private readonly prisma: PrismaService,
    private readonly productVariantsRepository: ProductVariantsRepository,
  ) {}

  async create(product: Product, config?: PrismaConfig): Promise<void> {
    const prisma = config ? config.prisma : this.prisma

    const productVariants = product.productVariants?.getNewItems() ?? []

    await prisma.product.create({
      data: ProductsPrismaMapper.toPrisma(product),
    })

    if (productVariants.length >= 1) {
      await this.productVariantsRepository.createMany(productVariants, config)
    }
  }

  async save(
    product: Product,
    config?: PrismaConfig | undefined,
  ): Promise<void> {
    const prisma = config ? config.prisma : this.prisma

    await prisma.product.update({
      where: {
        id: product.id.toString(),
      },
      data: ProductsPrismaMapper.toPrisma(product),
    })

    if (product.productVariants) {
      const productVariants = product.productVariants.getNewItems()
      await this.productVariantsRepository.createMany(productVariants, config)
    }
  }

  async findById(id: string): Promise<Product | null> {
    const product = await this.prisma.product.findUnique({
      where: {
        id,
      },
    })

    if (!product) return null

    return ProductsPrismaMapper.toEntity(product)
  }
}
