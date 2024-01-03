import { ProductCategory } from '../entities/ProductCategory'

export abstract class ProductCategoriesRepository {
  abstract create(productCategory: ProductCategory): Promise<void>
  abstract createMany(productCategories: ProductCategory[]): Promise<void>
  abstract findByName(name: string): Promise<ProductCategory | null>
  abstract findByNames(names: string[]): Promise<Array<ProductCategory | null>>
}
