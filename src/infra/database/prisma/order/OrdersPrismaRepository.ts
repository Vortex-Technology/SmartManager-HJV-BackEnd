import { Order } from '@modules/order/entities/Order'
import { OrdersRepository } from '@modules/order/repositories/OrdersRepository'
import { PrismaConfig, PrismaService } from '../index.service'
import { OrdersPrismaMapper } from './OrdersPrismaMapper'
import { Injectable } from '@nestjs/common'
import { OrdersProductsVariantsRepository } from '@modules/order/repositories/OrdersProductsVariantsRepository'

@Injectable()
export class OrdersPrismaRepository implements OrdersRepository<PrismaConfig> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ordersProductsVariantsRepository: OrdersProductsVariantsRepository,
  ) {}

  async create(order: Order): Promise<void> {
    await this.prisma.order.create({
      data: OrdersPrismaMapper.toPrisma(order),
    })
  }

  async findByIdWithProducts(id: string): Promise<Order | null> {
    const order = await this.prisma.order.findUnique({
      where: {
        id,
      },
      include: {
        orderProductsVariants: true,
      },
    })

    if (!order) return null

    return OrdersPrismaMapper.toEntity(order)
  }

  async save(order: Order, config?: PrismaConfig): Promise<void> {
    const prisma = config ? config.prisma : this.prisma

    await prisma.order.update({
      where: {
        id: order.id.toString(),
      },
      data: OrdersPrismaMapper.toPrisma(order),
    })

    if (order.orderProductsVariants) {
      const newOrderProductsVariants = order.orderProductsVariants.getNewItems()
      this.ordersProductsVariantsRepository.createMany(
        newOrderProductsVariants,
        config,
      )
    }
  }
}
