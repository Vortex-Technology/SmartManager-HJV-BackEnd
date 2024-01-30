import { ProductCategory } from '../entities/ProductCategory'

export abstract class ProductCategoriesRepository<ConfigT = unknown> {
  abstract create(productCategory: ProductCategory): Promise<void>
  abstract createMany(
    productCategories: ProductCategory[],
    config?: ConfigT,
  ): Promise<void>

  abstract findByName(name: string): Promise<ProductCategory | null>
  abstract findByNames(names: string[]): Promise<Array<ProductCategory | null>>
}
