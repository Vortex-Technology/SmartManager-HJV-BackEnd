import { ProductCategory } from '@modules/product/entities/ProductCategory'
import { ProductCategoriesRepository } from '@modules/product/repositories/ProductCategoriesRepository'

export class ProductCategoryInMemoryRepository
  implements ProductCategoriesRepository
{
  productCategories: ProductCategory[] = []

  async create(productCategory: ProductCategory): Promise<void> {
    this.productCategories.push(productCategory)
  }

  async findByName(name: string): Promise<ProductCategory | null> {
    const productCategory = this.productCategories.find(
      (productCategory) => productCategory.name === name,
    )

    if (!productCategory) return null

    return productCategory
  }

  async createMany(productCategories: ProductCategory[]): Promise<void> {
    this.productCategories.push(...productCategories)
  }

  async findByNames(names: string[]): Promise<(ProductCategory | null)[]> {
    const productCategories: (ProductCategory | null)[] = []

    names.forEach(async (name) => {
      productCategories.push(await this.findByName(name))
    })

    return productCategories
  }
}
