import { OrderProductVariant } from '@modules/order/entities/OrderProductVariant'
import {
  OrderProductsVariants as OrderProductsVariantsPrisma,
  Prisma,
} from '@prisma/client'
import { UniqueEntityId } from '@shared/core/valueObjects/UniqueEntityId'

export class OrdersProductsVariantsPrismaMapper {
  static toEntity(raw: OrderProductsVariantsPrisma): OrderProductVariant {
    return OrderProductVariant.create({
      orderId: new UniqueEntityId(raw.orderId),
      productVariantId: new UniqueEntityId(raw.productVariantId),
      quantity: raw.quantity,
    })
  }

  static toPrisma(
    orderProductsVariant: OrderProductVariant,
  ): Prisma.OrderProductsVariantsUncheckedCreateInput {
    return {
      orderId: orderProductsVariant.orderId.toString(),
      productVariantId: orderProductsVariant.productVariantId.toString(),
      quantity: orderProductsVariant.quantity,
    }
  }
}
