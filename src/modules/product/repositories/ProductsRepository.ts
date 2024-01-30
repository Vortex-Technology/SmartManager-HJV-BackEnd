import { Product } from '../entities/Product'

export abstract class ProductsRepository<ConfigT = unknown> {
  abstract create(product: Product, config?: ConfigT): Promise<void>
  abstract save(product: Product, config?: ConfigT): Promise<void>
  abstract findById(id: string): Promise<Product | null>
}
