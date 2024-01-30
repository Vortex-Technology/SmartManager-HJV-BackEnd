import { PrismaService } from '@infra/database/prisma/index.service'
import { OrdersPrismaMapper } from '@infra/database/prisma/order/OrdersPrismaMapper'
import { OrdersProductsVariantsPrismaMapper } from '@infra/database/prisma/order/OrdersProductsVariantsPrismaMapper'
import { Order, OrderProps } from '@modules/order/entities/Order'
import { Injectable } from '@nestjs/common'
import { UniqueEntityId } from '@shared/core/valueObjects/UniqueEntityId'

export function makeOrder(
  override: Partial<OrderProps> = {},
  id?: UniqueEntityId,
): Order {
  const order = Order.create(
    {
      marketId: new UniqueEntityId(),
      companyId: new UniqueEntityId(),
      openedById: new UniqueEntityId(),
      ...override,
    },
    id,
  )

  return order
}

@Injectable()
export class MakeOrder {
  constructor(private readonly prisma: PrismaService) {}

  async create(override: Partial<OrderProps> = {}, id?: UniqueEntityId) {
    const order = makeOrder(override, id)

    await this.prisma.order.create({
      data: OrdersPrismaMapper.toPrisma(order),
    })

    if (order.orderProductsVariants) {
      const newOrderProductsVariants = order.orderProductsVariants.getNewItems()

      await this.prisma.orderProductsVariants.createMany({
        data: newOrderProductsVariants.map(
          OrdersProductsVariantsPrismaMapper.toPrisma,
        ),
      })
    }

    return order
  }
}
