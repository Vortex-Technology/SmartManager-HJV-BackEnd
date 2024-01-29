import { Optional } from '@shared/core/types/Optional'
import { AggregateRoot } from '@shared/core/entities/AggregateRoot'
import { UniqueEntityId } from '@shared/core/valueObjects/UniqueEntityId'
import { OrderPayment } from './valueObjects/OrderPayment'
import { Protocol } from '@shared/core/valueObjects/Protocol'
import { OrderProductsVariantsList } from './OrderProductsVariantsList'
import { z } from 'zod'
import { ZodEntityValidationPipe } from '@shared/pipes/ZodEntityValidation'

const orderPropsSchema = z.object({
  protocol: z.instanceof(Protocol),
  subTotal: z.number().min(0),
  total: z.number().min(0),
  discount: z.number().min(0).nullable(),
  openedAt: z.date(),
  closedAt: z.date().nullable(),
  refundedAt: z.date().nullable(),
  deletedAt: z.date().nullable(),
  updatedAt: z.date().nullable(),
  openedById: z.instanceof(UniqueEntityId),
  closedById: z.instanceof(UniqueEntityId).nullable(),
  marketId: z.instanceof(UniqueEntityId),
  companyId: z.instanceof(UniqueEntityId),
  payment: z
    .custom<OrderPayment>((v): v is OrderPayment => v instanceof OrderPayment)
    .nullable(),
  orderProductsVariants: z.instanceof(OrderProductsVariantsList).nullable(),
})

const orderValidationPipe = new ZodEntityValidationPipe(orderPropsSchema)

export type OrderProps = z.infer<typeof orderPropsSchema>

export class Order extends AggregateRoot<OrderProps> {
  static create(
    props: Optional<
      OrderProps,
      | 'closedAt'
      | 'closedById'
      | 'deletedAt'
      | 'updatedAt'
      | 'openedAt'
      | 'refundedAt'
      | 'discount'
      | 'payment'
      | 'subTotal'
      | 'protocol'
      | 'total'
      | 'orderProductsVariants'
    >,
    id?: UniqueEntityId,
  ): Order {
    const orderProps: OrderProps = {
      ...props,
      closedAt: props.closedAt ?? null,
      updatedAt: props.updatedAt ?? null,
      closedById: props.closedById ?? null,
      deletedAt: props.deletedAt ?? null,
      refundedAt: props.refundedAt ?? null,
      openedAt: props.openedAt ?? new Date(),
      discount: props.discount ?? null,
      payment: props.payment ?? null,
      protocol: props.protocol ?? new Protocol(),
      subTotal: props.subTotal ?? 0,
      total: props.total ?? 0,
      orderProductsVariants: props.orderProductsVariants ?? null,
    }

    const order = new Order(orderProps, id)
    order.validate(orderValidationPipe)

    return order
  }

  get subTotal() {
    return this.props.subTotal
  }

  get total() {
    return this.props.total
  }

  get discount() {
    return this.props.discount
  }

  get openedAt() {
    return this.props.openedAt
  }

  get closedAt() {
    return this.props.closedAt
  }

  get refundedAt() {
    return this.props.refundedAt
  }

  get deletedAt() {
    return this.props.deletedAt
  }

  get updatedAt() {
    return this.props.updatedAt
  }

  get openedById() {
    return this.props.openedById
  }

  get closedById() {
    return this.props.closedById
  }

  get marketId() {
    return this.props.marketId
  }

  get companyId() {
    return this.props.companyId
  }

  get payment() {
    return this.props.payment
  }

  get protocol() {
    return this.props.protocol
  }
}
