import { Order } from '../entities/Order'

export abstract class OrdersRepository {
  abstract create(order: Order): Promise<void>
}
