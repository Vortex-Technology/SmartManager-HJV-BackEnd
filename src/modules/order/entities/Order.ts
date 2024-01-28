import { Optional } from '@shared/core/types/Optional'
import { AggregateRoot } from '@shared/core/entities/AggregateRoot'
import { UniqueEntityId } from '@shared/core/valueObjects/UniqueEntityId'
import { OrderPayment } from './valueObjects/OrderPayment'
import { Protocol } from '@shared/core/valueObjects/Protocol'
import { OrderProductsVariantsList } from './OrderProductsVariantsList'

export interface OrderProps {
  protocol: Protocol
  subTotal: number
  total: number
  discount: number | null
  openedAt: Date
  closedAt: Date | null
  refundedAt: Date | null
  deletedAt: Date | null
  updatedAt: Date | null
  openedById: UniqueEntityId
  closedById: UniqueEntityId | null
  marketId: UniqueEntityId
  companyId: UniqueEntityId
  payment: OrderPayment | null
  orderProductsVariants: OrderProductsVariantsList | null
}

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
    return new Order(
      {
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
      },
      id,
    )
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
