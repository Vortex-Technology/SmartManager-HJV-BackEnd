import { Order } from '@modules/order/entities/Order'
import { OrdersRepository } from '@modules/order/repositories/OrdersRepository'

export class OrdersInMemoryRepository extends OrdersRepository {
  orders: Order[] = []

  async create(order: Order): Promise<void> {
    this.orders.push(order)
  }
}
