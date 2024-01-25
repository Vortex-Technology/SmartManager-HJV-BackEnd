import { Product } from '../entities/Product'

export abstract class ProductsRepository<ConfigT = unknown> {
  abstract create(product: Product, config?: ConfigT): Promise<void>
}
