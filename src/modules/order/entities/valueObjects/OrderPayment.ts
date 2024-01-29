import { ValueObject } from '@shared/core/entities/ValueObject'
import { Optional } from '@shared/core/types/Optional'
import { ZodEntityValidationPipe } from '@shared/pipes/ZodEntityValidation'
import { z } from 'zod'

export enum OrderPaymentStatus {
  PENDING = 'PENDING',
  PAYED = 'PAYED',
  REFUSED = 'REFUSED',
  REFUNDED = 'REFUNDED',
}

export enum OrderPaymentMethod {
  CREDIT_CARD = 'CREDIT_CARD',
  CASH = 'CASH',
  DEBIT_CARD = 'DEBIT_CARD',
}

const orderPaymentPropsSchema = z.object({
  method: z.nativeEnum(OrderPaymentMethod),
  status: z.nativeEnum(OrderPaymentStatus),
  processedAt: z.date(),
  amount: z.number().min(0),
})

const orderPaymentValidationPipe = new ZodEntityValidationPipe(
  orderPaymentPropsSchema,
)

export type OrderPaymentProps = z.infer<typeof orderPaymentPropsSchema>

export class OrderPayment extends ValueObject<OrderPaymentProps> {
  static create(props: Optional<OrderPaymentProps, 'processedAt'>) {
    const orderPaymentProps: OrderPaymentProps = {
      ...props,
      processedAt: props.processedAt ?? new Date(),
    }

    const orderPayment = new OrderPayment(orderPaymentProps)
    orderPayment.validate(orderPaymentValidationPipe)

    return orderPayment
  }

  get method() {
    return this.props.method
  }

  get status() {
    return this.props.status
  }

  get processedAt() {
    return this.props.processedAt
  }

  get amount() {
    return this.props.amount
  }
}
