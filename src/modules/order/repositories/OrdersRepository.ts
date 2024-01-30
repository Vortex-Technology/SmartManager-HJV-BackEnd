import { Order } from '../entities/Order'

export abstract class OrdersRepository<ConfigT = unknown> {
  abstract create(order: Order): Promise<void>
  abstract findByIdWithProducts(id: string): Promise<Order | null>
  abstract save(order: Order, config?: ConfigT): Promise<void>
}
