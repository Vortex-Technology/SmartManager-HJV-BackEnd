import { AggregateRoot } from '@shared/core/entities/AggregateRoot'
import { UniqueEntityId } from '@shared/core/valueObjects/UniqueEntityId'
import { ZodEntityValidationPipe } from '@shared/pipes/ZodEntityValidation'
import { z } from 'zod'

const orderProductVariantPropsSchema = z.object({
  productVariantId: z.instanceof(UniqueEntityId),
  orderId: z.instanceof(UniqueEntityId),
  quantity: z.number().min(1),
})

const orderProductVariantValidationPipe = new ZodEntityValidationPipe(
  orderProductVariantPropsSchema,
)

export type OrderProductVariantProps = z.infer<
  typeof orderProductVariantPropsSchema
>

export class OrderProductVariant extends AggregateRoot<OrderProductVariantProps> {
  static create(
    props: OrderProductVariantProps,
    id?: UniqueEntityId,
  ): OrderProductVariant {
    const orderProductVariantProps: OrderProductVariantProps = {
      ...props,
    }

    const orderProductVariant = new OrderProductVariant(
      orderProductVariantProps,
      id,
    )
    orderProductVariant.validate(orderProductVariantValidationPipe)

    return orderProductVariant
  }

  get productVariantId() {
    return this.props.productVariantId
  }

  get orderId() {
    return this.props.orderId
  }

  get quantity() {
    return this.props.quantity
  }
}
