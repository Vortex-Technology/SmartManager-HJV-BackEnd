import { ProductVariant } from '@modules/product/entities/ProductVariant'
import { ProductVariantsRepository } from '@modules/product/repositories/ProductVariantsRepository'

export class ProductVariantInMemoryRepository
  implements ProductVariantsRepository
{
  productVariants: ProductVariant[] = []

  async create(productVariant: ProductVariant): Promise<void> {
    this.productVariants.push(productVariant)
  }

  async createMany(productVariants: ProductVariant[]): Promise<void> {
    this.productVariants.push(...productVariants)
  }

  async findByBarCode(barCode: string): Promise<ProductVariant | null> {
    const productVariant = this.productVariants.find(
      (productVariant) => productVariant.barCode === barCode,
    )

    if (!productVariant) return null

    return productVariant
  }

  async findByBarCodes(barCodes: string[]): Promise<(ProductVariant | null)[]> {
    const productVariants: (ProductVariant | null)[] = []

    barCodes.forEach(async (barCode) => {
      productVariants.push(await this.findByBarCode(barCode))
    })

    return productVariants
  }
}
