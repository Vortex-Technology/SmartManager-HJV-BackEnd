import { Order } from '@modules/order/entities/Order'
import { OrdersRepository } from '@modules/order/repositories/OrdersRepository'

export class OrdersInMemoryRepository extends OrdersRepository {
  orders: Order[] = []

  async create(order: Order): Promise<void> {
    this.orders.push(order)
  }

  async findByIdWithProducts(id: string): Promise<Order | null> {
    const product = this.orders.find((product) => product.id.toString() === id)

    if (!product) return null

    return product
  }

  async save(order: Order): Promise<void> {
    const productIndex = this.orders.findIndex((existingProduct) =>
      existingProduct.equals(order),
    )

    if (productIndex === -1) {
      throw new Error('Make sure you already create product')
    }

    this.orders[productIndex] = order
  }
}
