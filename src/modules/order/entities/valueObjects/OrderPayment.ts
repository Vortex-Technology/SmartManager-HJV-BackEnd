import { ValueObject } from '@shared/core/entities/ValueObject'
import { Optional } from '@shared/core/types/Optional'

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

export interface OrderPaymentProps {
  method: OrderPaymentMethod
  status: OrderPaymentStatus
  processedAt: Date
  amount: number
}

export class OrderPayment extends ValueObject<OrderPaymentProps> {
  static create(props: Optional<OrderPaymentProps, 'processedAt'>) {
    return new OrderPayment({
      ...props,
      processedAt: props.processedAt ?? new Date(),
    })
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
