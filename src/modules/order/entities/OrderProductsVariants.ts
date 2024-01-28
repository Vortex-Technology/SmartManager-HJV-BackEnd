import { AggregateRoot } from '@shared/core/entities/AggregateRoot'
import { UniqueEntityId } from '@shared/core/valueObjects/UniqueEntityId'

export interface OrderProductsVariantsProps {
  productVariantId: UniqueEntityId
  orderId: UniqueEntityId
  quantity: number
}

export class OrderProductsVariants extends AggregateRoot<OrderProductsVariantsProps> {
  static create(props: OrderProductsVariantsProps): OrderProductsVariants {
    return new OrderProductsVariants(props)
  }
}
