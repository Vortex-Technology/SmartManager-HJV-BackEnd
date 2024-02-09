import { Order } from '@modules/order/entities/Order'
import {
  OrderPayment,
  OrderPaymentMethod,
  OrderPaymentStatus,
} from '@modules/order/entities/valueObjects/OrderPayment'
import {
  Prisma,
  Order as OrderBasePrisma,
  OrderPayment as OrderPaymentPrisma,
  OrderProductsVariants as OrderProductsVariantsPrisma,
} from '@prisma/client'
import { Protocol } from '@shared/core/valueObjects/Protocol'
import { UniqueEntityId } from '@shared/core/valueObjects/UniqueEntityId'
import { OrdersProductsVariantsPrismaMapper } from './OrdersProductsVariantsPrismaMapper'
import { OrderProductsVariantsList } from '@modules/order/entities/OrderProductsVariantsList'

export type OrderPrisma = OrderBasePrisma & {
  orderPayment?: OrderPaymentPrisma | null
  orderProductsVariants?: OrderProductsVariantsPrisma[]
}

export class OrdersPrismaMapper {
  static toEntity(raw: OrderPrisma): Order {
    return Order.create(
      {
        companyId: new UniqueEntityId(raw.companyId),
        marketId: new UniqueEntityId(raw.marketId),
        openedById: new UniqueEntityId(raw.openedByCollaboratorId),
        closedAt: raw.closedAt,
        closedById: raw.closedByCollaboratorId
          ? new UniqueEntityId(raw.closedByCollaboratorId)
          : null,
        deletedAt: raw.deletedAt,
        discount: raw.discount,
        openedAt: raw.openedAt,
        protocol: new Protocol(raw.protocol),
        refundedAt: raw.refundedAt,
        subTotal: raw.subTotal,
        total: raw.total,
        updatedAt: raw.updatedAt,
        reportUrl: raw.reportUrl,
        payment: raw.orderPayment
          ? OrderPayment.create({
            amount: raw.orderPayment.amount,
            method: raw.orderPayment.method as OrderPaymentMethod,
            status: raw.orderPayment.status as OrderPaymentStatus,
            processedAt: raw.orderPayment.processedAt,
          })
          : null,
        orderProductsVariants: raw.orderProductsVariants
          ? new OrderProductsVariantsList(
            raw.orderProductsVariants.map(
              OrdersProductsVariantsPrismaMapper.toEntity,
            ),
          )
          : null,
      },
      new UniqueEntityId(raw.id),
    )
  }

  static toPrisma(order: Order): Prisma.OrderUncheckedCreateInput {
    return {
      companyId: order.companyId.toString(),
      marketId: order.marketId.toString(),
      openedByCollaboratorId: order.openedById.toString(),
      closedAt: order.closedAt,
      closedByCollaboratorId: order.closedById?.toString(),
      deletedAt: order.deletedAt,
      discount: order.discount,
      openedAt: order.openedAt,
      protocol: order.protocol.toValue(),
      refundedAt: order.refundedAt,
      subTotal: order.subTotal,
      total: order.total,
      updatedAt: order.updatedAt,
      id: order.id.toString(),
      reportUrl: order.reportUrl,
    }
  }
}
