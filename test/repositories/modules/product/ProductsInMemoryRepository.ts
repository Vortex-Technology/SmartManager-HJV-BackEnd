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

  async save(product: Product): Promise<void> {
    const productIndex = this.products.findIndex((existingProduct) =>
      existingProduct.equals(product),
    )

    if (productIndex === -1) {
      throw new Error('Make sure you already create product')
    }

    this.products[productIndex] = product

    const productVariants = product.productVariants?.getNewItems()

    if (productVariants) {
      await this.productVariantsRepository.createMany(productVariants)
    }
  }

  async findById(id: string): Promise<Product | null> {
    const product = this.products.find(
      (product) => product.id.toString() === id,
    )

    if (!product) return null

    return product
  }
}
