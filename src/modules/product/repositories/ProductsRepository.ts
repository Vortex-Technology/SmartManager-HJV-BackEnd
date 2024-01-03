import { Product } from '../entities/Product'

export abstract class ProductsRepository {
  abstract create(product: Product): Promise<void>
}
