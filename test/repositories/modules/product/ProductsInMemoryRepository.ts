import { Product } from '@modules/product/entities/Product'
import { ProductsRepository } from '@modules/product/repositories/ProductsRepository'
import { ProductVariantsInMemoryRepository } from './ProductVariantsInMemoryRepository'

export class ProductsInMemoryRepository implements ProductsRepository {
  constructor(
    private readonly productVariantsRepository: ProductVariantsInMemoryRepository,
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
