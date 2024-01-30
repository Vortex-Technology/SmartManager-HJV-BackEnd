import { ProductVariant } from '@modules/product/entities/ProductVariant'
import { ProductVariantsRepository } from '@modules/product/repositories/ProductVariantsRepository'
import { Injectable } from '@nestjs/common'
import { PrismaConfig, PrismaService } from '../index.service'
import { ProductVariantsPrismaMapper } from './ProductVariantsPrismaMapper'

@Injectable()
export class ProductVariantsPrismaRepository
  implements ProductVariantsRepository<PrismaConfig>
{
  constructor(private readonly prisma: PrismaService) {}

  async create(productVariant: ProductVariant): Promise<void> {
    await this.prisma.productVariant.create({
      data: ProductVariantsPrismaMapper.toPrisma(productVariant),
    })
  }

  async createMany(
    productVariants: ProductVariant[],
    config?: PrismaConfig,
  ): Promise<void> {
    const prisma = config ? config.prisma : this.prisma

    await prisma.productVariant.createMany({
      data: productVariants.map(ProductVariantsPrismaMapper.toPrisma),
    })
  }

  async findByBarCode(barCode: string): Promise<ProductVariant | null> {
    const productVariant = await this.prisma.productVariant.findUnique({
      where: {
        barCode,
      },
    })

    if (!productVariant) return null

    return ProductVariantsPrismaMapper.toEntity(productVariant)
  }

  async findByBarCodes(barCodes: string[]): Promise<(ProductVariant | null)[]> {
    const productVariants = await this.prisma.productVariant.findMany({
      where: {
        barCode: {
          in: barCodes,
        },
      },
    })

    const productsVariantsWithNullValues = barCodes.map((barCode) => {
      const productVariant = productVariants.find(
        (pv) => pv.barCode === barCode,
      )
      if (!productVariant) return null
      return productVariant
    })

    return productsVariantsWithNullValues.map((productVariant) =>
      productVariant
        ? ProductVariantsPrismaMapper.toEntity(productVariant)
        : null,
    )
  }
}
