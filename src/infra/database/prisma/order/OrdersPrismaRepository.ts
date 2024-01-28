import { Order } from '@modules/order/entities/Order'
import { OrdersRepository } from '@modules/order/repositories/OrdersRepository'
import { PrismaService } from '../index.service'
import { OrdersPrismaMapper } from './OrdersPrismaMapper'
import { Injectable } from '@nestjs/common'

@Injectable()
export class OrdersPrismaRepository implements OrdersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(order: Order): Promise<void> {
    await this.prisma.order.create({
      data: OrdersPrismaMapper.toPrisma(order),
    })
  }
}
