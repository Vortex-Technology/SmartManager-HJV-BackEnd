import { ProductVariant } from '../entities/ProductVariant'

export abstract class ProductVariantsRepository {
  abstract create(productVariant: ProductVariant): Promise<void>
  abstract createMany(productVariants: ProductVariant[]): Promise<void>
  abstract findByBarCode(barCode: string): Promise<ProductVariant | null>
  abstract findByBarCodes(
    barCodes: string[],
  ): Promise<Array<ProductVariant | null>>
}
