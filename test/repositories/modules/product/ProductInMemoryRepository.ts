import { Product } from '@modules/product/entities/Product'
import { ProductVariantsRepository } from '@modules/product/repositories/ProductVariantsRepository'
import { ProductsRepository } from '@modules/product/repositories/ProductsRepository'

export class ProductInMemoryRepository implements ProductsRepository {
  constructor(
    private readonly productVariantsRepository: ProductVariantsRepository,
  ) {}

  products: Product[] = []

  async create(product: Product): Promise<void> {
    const productVariantsToAdd = product.productVariants?.getNewItems()

    if (productVariantsToAdd) {
      await this.productVariantsRepository.createMany(productVariantsToAdd)
    }

    this.products.push(product)
  }
}
