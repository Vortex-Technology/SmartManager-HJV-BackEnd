import { PrismaService } from '@infra/database/prisma/index.service'
import { OrdersProductsVariantsPrismaMapper } from '@infra/database/prisma/order/OrdersProductsVariantsPrismaMapper'
import {
  OrderProductVariant,
  OrderProductVariantProps,
} from '@modules/order/entities/OrderProductVariant'
import { Injectable } from '@nestjs/common'
import { UniqueEntityId } from '@shared/core/valueObjects/UniqueEntityId'

export function makeOrderProductVariant(
  override: Partial<OrderProductVariantProps> = {},
  id?: UniqueEntityId,
): OrderProductVariant {
  const orderProductVariant = OrderProductVariant.create(
    {
      orderId: new UniqueEntityId(),
      quantity: 10,
      productVariantId: new UniqueEntityId(),
      ...override,
    },
    id,
  )

  return orderProductVariant
}

@Injectable()
export class MakeOrderProductVariant {
  constructor(private readonly prisma: PrismaService) { }

  async create(
    override: Partial<OrderProductVariantProps> = {},
    id?: UniqueEntityId,
  ) {
    const orderProductVariant = makeOrderProductVariant(override, id)

    await this.prisma.orderProductsVariants.create({
      data: OrdersProductsVariantsPrismaMapper.toPrisma(orderProductVariant),
    })

    return orderProductVariant
  }
}
