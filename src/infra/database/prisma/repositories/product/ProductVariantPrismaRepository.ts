import { ProductVariant } from '@modules/product/entities/ProductVariant'
import { ProductVariantsRepository } from '@modules/product/repositories/ProductVariantsRepository'
import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../index.service'
import { ProductVariantPrismaMapper } from './ProductVariantPrismaMapper'

@Injectable()
export class ProductVariantPrismaRepository
  implements ProductVariantsRepository
{
  constructor(private readonly prisma: PrismaService) {}

  async create(productVariant: ProductVariant): Promise<void> {
    await this.prisma.productVariant.create({
      data: ProductVariantPrismaMapper.toPrisma(productVariant),
    })
  }

  async createMany(productVariants: ProductVariant[]): Promise<void> {
    await this.prisma.productVariant.createMany({
      data: productVariants.map(ProductVariantPrismaMapper.toPrisma),
    })
  }

  async findByBarCode(barCode: string): Promise<ProductVariant | null> {
    const productVariant = await this.prisma.productVariant.findUnique({
      where: {
        barCode,
      },
    })

    if (!productVariant) return null

    return ProductVariantPrismaMapper.toEntity(productVariant)
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
        ? ProductVariantPrismaMapper.toEntity(productVariant)
        : null,
    )
  }
}
