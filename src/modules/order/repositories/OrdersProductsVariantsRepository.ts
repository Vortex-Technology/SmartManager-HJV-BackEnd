import { OrderProductVariant } from '../entities/OrderProductVariant'

export abstract class OrdersProductsVariantsRepository<ConfigT = unknown> {
  abstract createMany(
    orderProductsVariants: OrderProductVariant[],
    config?: ConfigT,
  ): Promise<void>
}
