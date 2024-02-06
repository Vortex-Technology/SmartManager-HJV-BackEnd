import { ProductVariant } from '../entities/ProductVariant'

export abstract class ProductVariantsRepository<ConfigT = unknown> {
  abstract create(productVariant: ProductVariant): Promise<void>
  abstract createMany(
    productVariants: ProductVariant[],
    config?: ConfigT,
  ): Promise<void>

  abstract findByBarCode(barCode: string): Promise<ProductVariant | null>
  abstract findByBarCodes(
    barCodes: string[],
  ): Promise<Array<ProductVariant | null>>

  abstract findByIds(ids: string[]): Promise<Array<ProductVariant | null>>
}
