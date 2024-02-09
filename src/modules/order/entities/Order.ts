import { Optional } from '@shared/core/types/Optional'
import { AggregateRoot } from '@shared/core/entities/AggregateRoot'
import { UniqueEntityId } from '@shared/core/valueObjects/UniqueEntityId'
import { OrderPayment } from './valueObjects/OrderPayment'
import { Protocol } from '@shared/core/valueObjects/Protocol'
import { OrderProductsVariantsList } from './OrderProductsVariantsList'
import { z } from 'zod'
import { ZodEntityValidationPipe } from '@shared/pipes/ZodEntityValidation'
import { OrderProductVariant } from './OrderProductVariant'

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
  reportUrl: z.string().nullable(),
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
      | 'reportUrl'
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
      reportUrl: props.reportUrl ?? null,
    }

    const order = new Order(orderProps, id)
    order.validate(orderValidationPipe)

    return order
  }

  get subTotal() {
    return this.props.subTotal
  }

  set subTotal(subTotal: number) {
    this.props.subTotal = subTotal
  }

  get total() {
    return this.props.total
  }

  set total(total: number) {
    this.props.total = total
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

  set closedById(closedById: UniqueEntityId | null) {
    this.props.closedById = closedById
    this.touch()
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

  get orderProductsVariants() {
    return this.props.orderProductsVariants
  }

  set orderProductsVariants(
    orderProductsVariants: OrderProductsVariantsList | null,
  ) {
    this.props.orderProductsVariants = orderProductsVariants
    this.touch()
  }

  get reportUrl() {
    return this.props.reportUrl
  }

  set reportUrl(reportUrl: string | null) {
    this.props.reportUrl = reportUrl
    this.touch()
  }

  addOrderProductVariant(orderProductVariant: OrderProductVariant) {
    if (!this.props.orderProductsVariants) {
      this.props.orderProductsVariants = new OrderProductsVariantsList()
    }

    this.props.orderProductsVariants.add(orderProductVariant)
    this.touch()
  }

  close() {
    this.props.closedAt = new Date()
    this.touch()
  }

  touch() {
    this.props.updatedAt = new Date()
  }
}
