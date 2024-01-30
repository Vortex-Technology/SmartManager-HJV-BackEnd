import { AggregateRoot } from '@shared/core/entities/AggregateRoot'
import { UniqueEntityId } from '@shared/core/valueObjects/UniqueEntityId'
import { Optional } from '@shared/core/types/Optional'
import { z } from 'zod'
import { ZodEntityValidationPipe } from '@shared/pipes/ZodEntityValidation'

const productVariantInventoryPropsSchema = z.object({
  quantity: z.number().min(0),
  productVariantId: z.instanceof(UniqueEntityId),
  inventoryId: z.instanceof(UniqueEntityId),
  createdAt: z.date(),
  updatedAt: z.date().nullable(),
  deletedAt: z.date().nullable(),
})

const productVariantInventoryValidationPipe = new ZodEntityValidationPipe(
  productVariantInventoryPropsSchema,
)

export type ProductVariantInventoryProps = z.infer<
  typeof productVariantInventoryPropsSchema
>

export class ProductVariantInventory extends AggregateRoot<ProductVariantInventoryProps> {
  static create(
    props: Optional<
      ProductVariantInventoryProps,
      'createdAt' | 'deletedAt' | 'updatedAt'
    >,
    id?: UniqueEntityId,
  ) {
    const productVariantInventoryProps: ProductVariantInventoryProps = {
      ...props,
      createdAt: props.createdAt ?? new Date(),
      updatedAt: props.updatedAt ?? null,
      deletedAt: props.deletedAt ?? null,
    }

    const productVariantInventory = new ProductVariantInventory(
      productVariantInventoryProps,
      id,
    )
    productVariantInventory.validate(productVariantInventoryValidationPipe)

    return productVariantInventory
  }

  get quantity() {
    return this.props.quantity
  }

  get productVariantId() {
    return this.props.productVariantId
  }

  get inventoryId() {
    return this.props.inventoryId
  }

  get createdAt() {
    return this.props.createdAt
  }

  get updatedAt() {
    return this.props.updatedAt
  }

  get deletedAt() {
    return this.props.deletedAt
  }

  decreaseQuantity(quantity: number) {
    this.props.quantity = this.props.quantity - quantity
    this.touch()
  }

  touch() {
    this.props.updatedAt = new Date()
  }
}
