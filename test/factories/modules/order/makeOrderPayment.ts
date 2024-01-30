import {
  OrderPayment,
  OrderPaymentMethod,
  OrderPaymentProps,
  OrderPaymentStatus,
} from '@modules/order/entities/valueObjects/OrderPayment'
import { fakerPT_BR } from '@faker-js/faker'

export function makeOrderPayment(
  override: Partial<OrderPaymentProps> = {},
): OrderPayment {
  const orderPayment = OrderPayment.create({
    amount: Number(fakerPT_BR.finance.amount()),
    method: OrderPaymentMethod.CASH,
    status: OrderPaymentStatus.PAYED,
    ...override,
  })

  return orderPayment
}
