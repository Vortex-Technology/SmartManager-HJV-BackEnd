import { ProductCategory } from '@modules/productCategory/entities/ProductCategory'
import { ProductCategoriesRepository } from '@modules/productCategory/repositories/ProductCategoriesRepository'

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
}
